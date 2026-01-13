using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Models;

namespace ContextManager.API.Services
{
    /// <summary>
    /// Service for interacting with Claude API for AI-powered task intelligence
    /// Handles task categorization and session planning
    /// </summary>
    public class ClaudeService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ApplicationDbContext _db;

        public ClaudeService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ApplicationDbContext db)
        {
            _httpClient = httpClientFactory.CreateClient();
            // Try environment variable first (Railway), then configuration
            _apiKey = Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY")
                ?? configuration["Anthropic:ApiKey"] 
                ?? throw new InvalidOperationException("Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable or configure in appsettings.json");
            _db = db;
            
            // Set up HTTP client for Claude API
            _httpClient.BaseAddress = new Uri("https://api.anthropic.com/");
            _httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
            _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
        }

        /// <summary>
        /// AI-powered context categorization - Categorizes a task into the appropriate mental context
        /// This is a core feature: intelligent task classification using Claude AI
        /// </summary>
        public async Task<ContextCategorizationResponse> CategorizeTaskAsync(string title, string description)
        {
            // Get all available contexts
            var contexts = await _db.Contexts.ToListAsync();
            
            if (!contexts.Any())
            {
                throw new InvalidOperationException("No contexts available in database");
            }

            // Build prompt for Claude to categorize the task
            var prompt = BuildCategorizationPrompt(title, description, contexts);

            // Call Claude API
            var claudeResponse = await CallClaudeApiAsync(prompt);

            // Parse and return the categorization
            return ParseCategorizationResponse(claudeResponse, contexts);
        }

        /// <summary>
        /// AI-powered session planning - Plans an entire work session across all contexts
        /// This is the star feature: intelligently orders tasks for the day with context grouping
        /// Returns a structured plan with tasks and reasoning
        /// Excludes completed, overdue, and already assigned tasks
        /// </summary>
        public async Task<SessionPlanResponse> GetSessionPlanAsync(Guid userId)
        {
            var now = DateTime.UtcNow;
            
            // Get tasks that are already assigned to any session plan
            var assignedTaskIds = await _db.SessionPlanItems
                .Where(spi => spi.SessionPlan.UserId == userId)
                .Select(spi => spi.TaskId)
                .Distinct()
                .ToListAsync();
            
            // Get available tasks:
            // - Not completed
            // - Not overdue
            // - Not already in a session plan
            var tasks = await _db.Tasks
                .Include(t => t.Context)
                .Include(t => t.User)
                .Where(t => t.UserId == userId 
                    && t.Status != Models.TaskStatus.Completed
                    && (t.DueDate == null || t.DueDate >= now)
                    && !assignedTaskIds.Contains(t.Id))
                .OrderBy(t => t.DueDate)
                .ThenByDescending(t => t.Priority)
                .ToListAsync();

            if (!tasks.Any())
            {
                return new SessionPlanResponse { Items = new List<SessionPlanItemResponse>() };
            }

            // Build session planning prompt
            var prompt = BuildSessionPlanningPrompt(tasks);

            // Call Claude API
            var claudeResponse = await CallClaudeApiAsync(prompt);

            // Parse session plan
            var sessionPlan = ParseSessionPlanResponse(claudeResponse, tasks);

            return sessionPlan;
        }

        /// <summary>
        /// Makes the HTTP request to Claude API
        /// </summary>
        private async Task<string> CallClaudeApiAsync(string prompt)
        {
            var requestBody = new
            {
                model = "claude-sonnet-4-5-20250929",
                max_tokens = 1024,
                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = prompt
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(
                "v1/messages",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Claude API error: {response.StatusCode} - {errorContent}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            
            // Parse Claude's response format
            using var doc = JsonDocument.Parse(responseJson);
            var contentArray = doc.RootElement.GetProperty("content");
            var textContent = contentArray[0].GetProperty("text").GetString();

            return textContent ?? throw new InvalidOperationException("No text content in Claude response");
        }

        /// <summary>
        /// Builds a prompt for Claude to categorize a task into the appropriate context
        /// </summary>
        private string BuildCategorizationPrompt(string title, string description, List<Context> contexts)
        {
            var contextList = string.Join("\n", contexts.Select((c, i) => 
                $"{i + 1}. {c.Name} - {c.Description}"));

            var taskInfo = string.IsNullOrWhiteSpace(description) 
                ? $"Title: {title}"
                : $"Title: {title}\nDescription: {description}";

            return $@"You are an intelligent task classification assistant. Analyze the following task and categorize it into the most appropriate mental context.

Task Information:
{taskInfo}

Available Contexts:
{contextList}

Instructions:
1. Analyze the task title and description
2. Determine which context best matches the mental mode required for this task
3. Consider the type of work: deep focus, collaboration, administrative, creative, or learning
4. Provide a confidence score (0.0 to 1.0) and brief reasoning

Respond ONLY with valid JSON in this exact format:
{{
  ""contextNumber"": 1,
  ""confidence"": 0.95,
  ""reasoning"": ""Brief explanation of why this context is appropriate""
}}

Important:
- contextNumber is the number from the list above (1-{contexts.Count})
- confidence is a score from 0.0 to 1.0
- Keep reasoning under 150 characters";
        }

        /// <summary>
        /// Parses Claude's context categorization response
        /// </summary>
        private ContextCategorizationResponse ParseCategorizationResponse(string claudeResponse, List<Context> contexts)
        {
            try
            {
                var jsonStart = claudeResponse.IndexOf('{');
                var jsonEnd = claudeResponse.LastIndexOf('}') + 1;
                var jsonString = claudeResponse.Substring(jsonStart, jsonEnd - jsonStart);

                using var doc = JsonDocument.Parse(jsonString);
                var contextNumber = doc.RootElement.GetProperty("contextNumber").GetInt32();
                var confidence = (float)doc.RootElement.GetProperty("confidence").GetDouble();
                var reasoning = doc.RootElement.GetProperty("reasoning").GetString() ?? "";

                if (contextNumber < 1 || contextNumber > contexts.Count)
                {
                    throw new InvalidOperationException($"Invalid context number: {contextNumber}");
                }

                var context = contexts[contextNumber - 1];

                return new ContextCategorizationResponse
                {
                    ContextId = context.Id,
                    ContextName = context.Name,
                    Confidence = confidence,
                    Reasoning = reasoning
                };
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Failed to parse Claude categorization response: {ex.Message}");
            }
        }

        /// <summary>
        /// Builds a prompt for Claude to plan an entire work session
        /// </summary>
        private string BuildSessionPlanningPrompt(List<Models.Task> tasks)
        {
            var currentHour = DateTime.Now.Hour;
            var timeOfDay = currentHour < 12 ? "morning" : currentHour < 17 ? "afternoon" : "evening";
            var dayOfWeek = DateTime.Now.DayOfWeek.ToString();

            var taskList = string.Join("\n", tasks.Select((t, i) => 
            {
                var priorityEmoji = t.Priority switch
                {
                    Priority.High => "🔴",
                    Priority.Medium => "🟡",
                    Priority.Low => "🟢",
                    _ => ""
                };
                var dueInfo = t.DueDate.HasValue 
                    ? $", Due: {t.DueDate.Value:MMM dd}" 
                    : "";
                return $"{i + 1}. {priorityEmoji} [{t.Title}] - Context: {t.Context.Name}, Priority: {t.Priority}, Time: {t.EstimatedMinutes}min{dueInfo}";
            }));

            return $@"You are an intelligent productivity assistant. Plan an optimal work session by ordering tasks across different mental contexts.

Current Time: {dayOfWeek} {timeOfDay} ({DateTime.Now:HH:mm})
Work Hours: 9:00 AM - 5:00 PM (8 hours available, no breaks)

Available Tasks ({tasks.Count} total):
{taskList}

Instructions:
1. Select tasks that fit within the 8-hour workday (480 minutes total)
2. Order them intelligently considering:
   - Context switching (group similar mental modes together to minimize cognitive load)
   - Time of day (meetings in afternoon, deep work in morning, admin tasks when appropriate)
   - Task priorities and deadlines (high priority and urgent tasks first)
   - Estimated time (MUST NOT exceed 480 minutes total)
3. Group consecutive tasks by context where possible to minimize mental switching
4. Aim for tasks that fill ~7-8 hours maximum
5. Provide brief reasoning for each task's position

Respond ONLY with valid JSON in this exact format:
{{
  ""tasks"": [
    {{
      ""taskNumber"": 1,
      ""reasoning"": ""Why this task at this position""
    }}
  ]
}}

Important:
- taskNumber is the number from the task list above (1-{tasks.Count})
- Total selected tasks MUST NOT exceed 480 minutes (8 hours)
- Order them from first to last (morning to afternoon)
- Group by context to reduce context switching
- Keep individual reasoning under 100 characters
- If you cannot fit all tasks, prioritize high priority and urgent tasks";
        }

        /// <summary>
        /// Parses Claude's session planning response
        /// </summary>
        private SessionPlanResponse ParseSessionPlanResponse(string claudeResponse, List<Models.Task> tasks)
        {
            try
            {
                var jsonStart = claudeResponse.IndexOf('{');
                var jsonEnd = claudeResponse.LastIndexOf('}') + 1;
                var jsonString = claudeResponse.Substring(jsonStart, jsonEnd - jsonStart);

                using var doc = JsonDocument.Parse(jsonString);
                var tasksArray = doc.RootElement.GetProperty("tasks");

                var items = new List<SessionPlanItemResponse>();

                foreach (var item in tasksArray.EnumerateArray())
                {
                    var taskNumber = item.GetProperty("taskNumber").GetInt32();
                    var reasoning = item.GetProperty("reasoning").GetString() ?? "";

                    if (taskNumber < 1 || taskNumber > tasks.Count)
                    {
                        continue;
                    }

                    var task = tasks[taskNumber - 1];

                    items.Add(new SessionPlanItemResponse
                    {
                        Id = Guid.NewGuid(),
                        Task = new TaskResponse
                        {
                            Id = task.Id,
                            UserId = task.UserId,
                            ContextId = task.ContextId,
                            ContextName = task.Context?.Name ?? "",
                            ContextColor = task.Context?.Color ?? "",
                            Title = task.Title,
                            Description = task.Description,
                        EstimatedMinutes = task.EstimatedMinutes,
                            Priority = task.Priority,
                            Status = task.Status,
                            DueDate = task.DueDate,
                            CreatedAt = task.CreatedAt,
                            CompletedAt = task.CompletedAt
                        },
                        Order = items.Count,
                        GroupNumber = 0, // Will be calculated later based on context grouping
                        Reasoning = reasoning
                    });
                }

                return new SessionPlanResponse
                {
                    Id = Guid.NewGuid(),
                    PlanDate = DateTime.UtcNow.Date,
                    CreatedAt = DateTime.UtcNow,
                    IsCustomized = false,
                    Items = items,
                    TotalEstimatedMinutes = items.Sum(i => i.Task.EstimatedMinutes)
                };
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Failed to parse session plan: {ex.Message}");
            }
        }
    }
}
