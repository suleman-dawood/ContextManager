using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Models;

namespace ContextManager.API.Services
{
    /// <summary>
    /// Service for interacting with Claude API to generate AI-powered task suggestions
    /// This is the star feature of the application!
    /// </summary>
    public class ClaudeService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ApplicationDbContext _db;

        public ClaudeService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ApplicationDbContext db)
        {
            _httpClient = httpClientFactory.CreateClient();
            _apiKey = configuration["Anthropic:ApiKey"] 
                ?? throw new InvalidOperationException("Anthropic API key not configured");
            _db = db;
            
            // Set up HTTP client for Claude API
            _httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
            _httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
        }

        /// <summary>
        /// Gets AI-powered task suggestions for a specific user and context
        /// Claude analyzes pending tasks and recommends the top 3 based on context, time, and priority
        /// </summary>
        public async Task<List<TaskSuggestionResponse>> GetSuggestionsAsync(Guid userId, Guid contextId)
        {
            // 1. Get user's pending tasks for this context
            var tasks = await _db.Tasks
                .Where(t => t.UserId == userId 
                         && t.ContextId == contextId 
                         && t.Status != TaskStatus.Completed)
                .OrderBy(t => t.DueDate)
                .ThenByDescending(t => t.Priority)
                .ToListAsync();

            // No tasks to suggest
            if (!tasks.Any())
            {
                return new List<TaskSuggestionResponse>();
            }

            // 2. Get context details
            var context = await _db.Contexts.FindAsync(contextId);
            if (context == null)
            {
                throw new ArgumentException("Invalid context ID");
            }

            // 3. Build the prompt for Claude
            var prompt = BuildPrompt(context, tasks);

            // 4. Call Claude API
            var claudeResponse = await CallClaudeApiAsync(prompt);

            // 5. Parse Claude's response and save suggestions to database
            var suggestions = await ParseAndSaveSuggestionsAsync(claudeResponse, tasks, userId, contextId);

            return suggestions;
        }

        /// <summary>
        /// Builds a detailed prompt for Claude to analyze tasks and provide suggestions
        /// </summary>
        private string BuildPrompt(Context context, List<Models.Task> tasks)
        {
            var currentHour = DateTime.Now.Hour;
            var timeOfDay = currentHour < 12 ? "morning" : currentHour < 17 ? "afternoon" : "evening";
            var dayOfWeek = DateTime.Now.DayOfWeek.ToString();

            // Create a numbered list of tasks with relevant details
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
                return $"{i + 1}. {priorityEmoji} [{t.Title}] - Priority: {t.Priority}, Estimated: {t.EstimatedMinutes}min{dueInfo}";
            }));

            return $@"You are a productivity assistant helping prioritize tasks for a specific mental context.

Context: {context.Name} - {context.Description}
Current Time: {dayOfWeek} {timeOfDay} ({DateTime.Now:HH:mm})

Available Tasks:
{taskList}

Instructions:
1. Suggest the TOP 3 tasks that best fit this ""{context.Name}"" context right now
2. Consider:
   - Time of day (energy levels, meeting times)
   - Task priority and deadlines
   - Estimated time (can it fit in a typical work session?)
   - Context fit (does it match the mental mode?)
3. Provide a brief, practical reasoning for each suggestion

Respond ONLY with valid JSON in this exact format:
{{
  ""suggestions"": [
    {{
      ""taskNumber"": 1,
      ""confidence"": 0.95,
      ""reasoning"": ""Brief explanation why this task is ideal right now""
    }}
  ]
}}

Important: 
- taskNumber is the number from the list above (1-{tasks.Count})
- confidence is a score from 0.0 to 1.0
- Suggest 1-3 tasks (fewer is better if others don't fit well)
- Keep reasoning under 100 characters";
        }

        /// <summary>
        /// Makes the HTTP request to Claude API
        /// </summary>
        private async Task<string> CallClaudeApiAsync(string prompt)
        {
            var requestBody = new
            {
                model = "claude-3-5-sonnet-20241022",
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
                "https://api.anthropic.com/v1/messages",
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

            return textContent ?? string.Empty;
        }

        /// <summary>
        /// Parses Claude's JSON response and saves suggestions to database
        /// </summary>
        private async Task<List<TaskSuggestionResponse>> ParseAndSaveSuggestionsAsync(
            string claudeResponse, 
            List<Models.Task> tasks, 
            Guid userId, 
            Guid contextId)
        {
            var suggestions = new List<TaskSuggestionResponse>();

            try
            {
                // Extract JSON from Claude's response (it might include extra text)
                var jsonStart = claudeResponse.IndexOf('{');
                var jsonEnd = claudeResponse.LastIndexOf('}') + 1;
                var jsonString = claudeResponse.Substring(jsonStart, jsonEnd - jsonStart);

                using var doc = JsonDocument.Parse(jsonString);
                var suggestionsArray = doc.RootElement.GetProperty("suggestions");

                foreach (var item in suggestionsArray.EnumerateArray())
                {
                    var taskNumber = item.GetProperty("taskNumber").GetInt32();
                    var confidence = (float)item.GetProperty("confidence").GetDouble();
                    var reasoning = item.GetProperty("reasoning").GetString() ?? "";

                    // Get the task (taskNumber is 1-indexed)
                    if (taskNumber < 1 || taskNumber > tasks.Count)
                    {
                        continue; // Skip invalid task numbers
                    }

                    var task = tasks[taskNumber - 1];

                    // Save suggestion to database
                    var suggestion = new TaskSuggestion
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        TaskId = task.Id,
                        ContextId = contextId,
                        ConfidenceScore = confidence,
                        Reasoning = reasoning,
                        CreatedAt = DateTime.UtcNow,
                        UserAccepted = null // No feedback yet
                    };

                    _db.TaskSuggestions.Add(suggestion);

                    // Add to response list
                    suggestions.Add(new TaskSuggestionResponse
                    {
                        Id = suggestion.Id,
                        TaskId = task.Id,
                        TaskTitle = task.Title,
                        TaskDescription = task.Description,
                        EstimatedMinutes = task.EstimatedMinutes,
                        Confidence = confidence,
                        Reasoning = reasoning,
                        CreatedAt = suggestion.CreatedAt
                    });
                }

                await _db.SaveChangesAsync();
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException($"Failed to parse Claude response: {ex.Message}");
            }

            return suggestions;
        }
    }
}

