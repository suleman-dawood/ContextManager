using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Models;
using TaskModel = ContextManager.API.Models.Task;
using Task = System.Threading.Tasks.Task;

namespace ContextManager.API.Services
{
    public class RecurrantTaskService 
    {
        private readonly ApplicationDbContext _db;

        public RecurrantTaskService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<RecurrantTaskResponse> CreateRecurrantTaskAsync(Guid userId, CreateRecurrantTaskRequest request)
        {
            if (request.ContextId == Guid.Empty)
            {
                throw new ArgumentException("ContextId is required");
            }

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                throw new ArgumentException("Title is required");
            }

            var context = await _db.Contexts.FindAsync(request.ContextId);
            if (context == null)
            {
                throw new ArgumentException("Invalid context ID");
            }

            if (context.UserId != userId)
            {
                throw new ArgumentException("Context does not belong to the current user");
            }

            string recurrenceDaysString = request.RecurrenceDays != null && request.RecurrenceDays.Any()
                ? string.Join(",", request.RecurrenceDays)
                : string.Empty;

            var recurringTask = new RecurrantTask
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ContextId = request.ContextId,
                Title = request.Title,
                Description = request.Description,
                EstimatedMinutes = request.EstimatedMinutes,
                Priority = request.Priority,
                RecurrenceType = request.RecurrenceType,
                RecurrenceDays = recurrenceDaysString,
                RecurrenceStartDate = request.RecurrenceStartDate,
                RecurrenceEndDate = request.RecurrenceEndDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _db.RecurrantTasks.Add(recurringTask);
            await _db.SaveChangesAsync();

            await GenerateRecurrantTaskInstances(userId, recurringTask.Id);

            var savedRecurringTask = await _db.RecurrantTasks
                .Include(rt => rt.Context)
                .Include(rt => rt.Tasks)
                .FirstAsync(rt => rt.Id == recurringTask.Id);

            return MapToDTO(savedRecurringTask);
        }

        public async Task<RecurrantTaskResponse> UpdateRecurrantTaskAsync(Guid userId, Guid recurringTaskId, UpdateRecurrantTaskRequest request)
        {
            var recurringTask = await _db.RecurrantTasks
                .Include(rt => rt.Context)
                .FirstOrDefaultAsync(rt => rt.Id == recurringTaskId && rt.UserId == userId);
            
            if (recurringTask == null)
            {
                throw new InvalidOperationException("Recurring task not found");
            }
            
            if (request.ContextId == Guid.Empty)
            {
                throw new ArgumentException("ContextId is required");
            }
            
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                throw new ArgumentException("Title is required");
            }

            var context = await _db.Contexts.FindAsync(request.ContextId);
            if (context == null)
            {
                throw new ArgumentException("Invalid context ID");
            }

            if (context.UserId != userId)
            {
                throw new ArgumentException("Context does not belong to the current user");
            }
            
            string recurrenceDaysString = request.RecurrenceDays != null && request.RecurrenceDays.Any()
                ? string.Join(",", request.RecurrenceDays)
                : string.Empty;

            var today = DateTime.UtcNow.Date;
            var futureInstances = await _db.Tasks
                .Where(t => t.RecurringTaskTemplateId == recurringTaskId 
                    && t.DueDate.HasValue 
                    && t.DueDate.Value.Date > today
                    && t.Status != Models.TaskStatus.Completed)
                .ToListAsync();
            
            _db.Tasks.RemoveRange(futureInstances);

            recurringTask.ContextId = request.ContextId;
            recurringTask.Title = request.Title;
            recurringTask.Description = request.Description;
            recurringTask.EstimatedMinutes = request.EstimatedMinutes;
            recurringTask.Priority = request.Priority;
            recurringTask.RecurrenceType = request.RecurrenceType;
            recurringTask.RecurrenceDays = recurrenceDaysString;
            recurringTask.RecurrenceStartDate = request.RecurrenceStartDate;
            recurringTask.RecurrenceEndDate = request.RecurrenceEndDate;
            recurringTask.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            
            await GenerateRecurrantTaskInstances(userId, recurringTaskId);

            var updatedRecurringTask = await _db.RecurrantTasks
                .Include(rt => rt.Context)
                .Include(rt => rt.Tasks)
                .FirstAsync(rt => rt.Id == recurringTaskId);

            return MapToDTO(updatedRecurringTask);
        }

        public async System.Threading.Tasks.Task DeleteRecurrantTaskAsync(Guid userId, Guid recurringTaskId)
        {
            var recurringTask = await _db.RecurrantTasks.FirstOrDefaultAsync(rt => rt.Id == recurringTaskId && rt.UserId == userId);
            if (recurringTask == null)
            {
                throw new InvalidOperationException("Recurring task not found");
            }
            _db.RecurrantTasks.Remove(recurringTask);
            await _db.SaveChangesAsync();
        }

        public async Task<RecurrantTaskResponse> GetRecurrantTaskAsync(Guid userId, Guid recurringTaskId)
        {
            var recurringTask = await _db.RecurrantTasks
                .Include(rt => rt.Context)
                .Include(rt => rt.Tasks)
                .FirstOrDefaultAsync(rt => rt.Id == recurringTaskId && rt.UserId == userId);
            
            if (recurringTask == null)
            {
                throw new InvalidOperationException("Recurring task not found");
            }
            
            return MapToDTO(recurringTask);
        }
        
        public async Task<List<RecurrantTaskResponse>> GetRecurrantTasksAsync(Guid userId)
        {
            var recurringTasks = await _db.RecurrantTasks
                .Include(rt => rt.Context)
                .Include(rt => rt.Tasks)
                .Where(rt => rt.UserId == userId)
                .ToListAsync();
            
            return recurringTasks.Select(MapToDTO).ToList();
        }

        public async System.Threading.Tasks.Task GenerateRecurrantTaskInstances(Guid userId, Guid recurringTaskId)
        {
            var recurringTask = await _db.RecurrantTasks.FirstOrDefaultAsync(rt => rt.Id == recurringTaskId && rt.UserId == userId);
            if (recurringTask == null)
            {
                throw new InvalidOperationException("Recurring task not found");
            }

            if (!recurringTask.IsActive)
            {
                return;
            }

            var today = DateTime.UtcNow.Date;
            var startDate = recurringTask.RecurrenceStartDate.Date;
            var endDate = recurringTask.RecurrenceEndDate?.Date ?? today.AddYears(1);
            var maxDate = today.AddYears(1);
            if (endDate > maxDate)
            {
                endDate = maxDate;
            }

            var recurrenceDaysList = string.IsNullOrEmpty(recurringTask.RecurrenceDays)
                ? new List<string>()
                : recurringTask.RecurrenceDays.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(d => d.Trim())
                    .ToList();

            // Get existing task instances for this recurring task to avoid duplicates
            var existingTaskDates = await _db.Tasks
                .Where(t => t.RecurringTaskTemplateId == recurringTaskId && t.DueDate.HasValue)
                .Select(t => t.DueDate!.Value.Date)
                .ToListAsync();
            
            var existingDates = new HashSet<DateTime>(existingTaskDates);

            var tasksToAdd = new List<TaskModel>();
            var recurrenceType = recurringTask.RecurrenceType;

            switch (recurrenceType)
            {
                case RecurrenceType.Daily:
                    for (var date = startDate; date <= endDate; date = date.AddDays(1))
                    {
                        if (date >= today && !existingDates.Contains(date))
                        {
                            tasksToAdd.Add(CreateTaskInstance(recurringTask, userId, date));
                        }
                    }
                    break;

                case RecurrenceType.Weekly:
                    for (var date = startDate; date <= endDate; date = date.AddDays(7))
                    {
                        if (date >= today && !existingDates.Contains(date))
                        {
                            tasksToAdd.Add(CreateTaskInstance(recurringTask, userId, date));
                        }
                    }
                    break;

                case RecurrenceType.Biweekly:
                    for (var date = startDate; date <= endDate; date = date.AddDays(14))
                    {
                        if (date >= today && !existingDates.Contains(date))
                        {
                            tasksToAdd.Add(CreateTaskInstance(recurringTask, userId, date));
                        }
                    }
                    break;

                case RecurrenceType.Monthly:
                    var currentDate = startDate;
                    while (currentDate <= endDate)
                    {
                        if (currentDate >= today && !existingDates.Contains(currentDate))
                        {
                            tasksToAdd.Add(CreateTaskInstance(recurringTask, userId, currentDate));
                        }
                        
                        // Move to next month, handling edge cases (e.g., Jan 31 -> Feb 28)
                        try
                        {
                            currentDate = currentDate.AddMonths(1);
                        }
                        catch
                        {
                            // If day doesn't exist in next month, use last day of month
                            var nextMonth = currentDate.AddMonths(1);
                            var daysInMonth = DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month);
                            currentDate = new DateTime(nextMonth.Year, nextMonth.Month, Math.Min(currentDate.Day, daysInMonth));
                        }
                    }
                    break;

                case RecurrenceType.Custom:

                    if (recurrenceDaysList.Count == 0)
                    {
                        throw new InvalidOperationException("RecurrenceDays must be specified for Custom recurrence type");
                    }

                    var dayOfWeekMap = new Dictionary<string, DayOfWeek>
                    {
                        { "Monday", DayOfWeek.Monday },
                        { "Tuesday", DayOfWeek.Tuesday },
                        { "Wednesday", DayOfWeek.Wednesday },
                        { "Thursday", DayOfWeek.Thursday },
                        { "Friday", DayOfWeek.Friday },
                        { "Saturday", DayOfWeek.Saturday },
                        { "Sunday", DayOfWeek.Sunday },
                        { "Mon", DayOfWeek.Monday },
                        { "Tue", DayOfWeek.Tuesday },
                        { "Wed", DayOfWeek.Wednesday },
                        { "Thu", DayOfWeek.Thursday },
                        { "Fri", DayOfWeek.Friday },
                        { "Sat", DayOfWeek.Saturday },
                        { "Sun", DayOfWeek.Sunday }
                    };

                    var targetDaysOfWeek = recurrenceDaysList
                        .Where(d => dayOfWeekMap.ContainsKey(d))
                        .Select(d => dayOfWeekMap[d])
                        .ToList();

                    if (targetDaysOfWeek.Count == 0)
                    {
                        throw new InvalidOperationException("Invalid day names in RecurrenceDays");
                    }

                    for (var date = startDate; date <= endDate; date = date.AddDays(1))
                    {
                        if (date >= today && targetDaysOfWeek.Contains(date.DayOfWeek) && !existingDates.Contains(date))
                        {
                            tasksToAdd.Add(CreateTaskInstance(recurringTask, userId, date));
                        }
                    }
                    break;

                default:
                    throw new InvalidOperationException("Invalid recurrence type");
            }

            if (tasksToAdd.Any())
            {
                _db.Tasks.AddRange(tasksToAdd);
                await _db.SaveChangesAsync();
                
                // Automatically add recurring task instances to session plans for their due dates
                await AddRecurringInstancesToSessionPlansAsync(userId, tasksToAdd);
            }
        }
        
        /// Automatically adds recurring task instances to session plans for their due dates
        private async Task AddRecurringInstancesToSessionPlansAsync(Guid userId, List<TaskModel> recurringInstances)
        {
            // Group instances by their due date
            var instancesByDate = recurringInstances
                .Where(t => t.DueDate.HasValue)
                .GroupBy(t => t.DueDate!.Value.Date)
                .ToList();
            
            foreach (var dateGroup in instancesByDate)
            {
                var planDate = DateTime.SpecifyKind(dateGroup.Key, DateTimeKind.Utc);
                var instances = dateGroup.ToList();
                
                // Get or create session plan for this date
                var sessionPlan = await _db.SessionPlans
                    .Include(sp => sp.Items)
                    .FirstOrDefaultAsync(sp => sp.UserId == userId && sp.PlanDate.Date == planDate.Date);
                
                if (sessionPlan == null)
                {
                    // Create a new session plan for this date
                    sessionPlan = new SessionPlan
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        PlanDate = planDate,
                        CreatedAt = DateTime.UtcNow,
                        IsCustomized = false,
                        Items = new List<SessionPlanItem>()
                    };
                    _db.SessionPlans.Add(sessionPlan);
                }
                
                // Get existing task IDs in the plan to avoid duplicates
                var existingTaskIds = sessionPlan.Items.Select(spi => spi.TaskId).ToHashSet();
                
                // Add recurring instances to the session plan
                // Group by context to maintain context grouping
                var instancesByContext = instances
                    .Where(t => !existingTaskIds.Contains(t.Id))
                    .GroupBy(t => t.ContextId)
                    .ToList();
                
                int currentOrder = sessionPlan.Items.Any() 
                    ? sessionPlan.Items.Max(spi => spi.Order) + 1 
                    : 0;
                int currentGroupNumber = sessionPlan.Items.Any()
                    ? sessionPlan.Items.Max(spi => spi.GroupNumber) + 1
                    : 0;
                
                foreach (var contextGroup in instancesByContext)
                {
                    foreach (var instance in contextGroup.OrderBy(t => t.Priority).ThenBy(t => t.CreatedAt))
                    {
                        var planItem = new SessionPlanItem
                        {
                            Id = Guid.NewGuid(),
                            SessionPlanId = sessionPlan.Id,
                            TaskId = instance.Id,
                            Order = currentOrder++,
                            GroupNumber = currentGroupNumber,
                            Reasoning = "Recurring task instance"
                        };
                        sessionPlan.Items.Add(planItem);
                    }
                    currentGroupNumber++;
                }
            }
            
            await _db.SaveChangesAsync();
        }

        private TaskModel CreateTaskInstance(RecurrantTask template, Guid userId, DateTime dueDate)
        {
            var dueDateUtc = DateTime.SpecifyKind(dueDate.Date, DateTimeKind.Utc);
            
            return new TaskModel
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ContextId = template.ContextId,
                Title = template.Title,
                Description = template.Description,
                EstimatedMinutes = template.EstimatedMinutes,
                Priority = template.Priority,
                Status = Models.TaskStatus.Todo,
                DueDate = dueDateUtc,
                RecurringTaskTemplateId = template.Id,
                IsRecurringInstance = true,
                CreatedAt = DateTime.UtcNow
            };
        }

        public RecurrantTaskResponse MapToDTO(RecurrantTask recurringTask)
        {
            List<string>? recurrenceDaysList = string.IsNullOrEmpty(recurringTask.RecurrenceDays)
                ? null
                : recurringTask.RecurrenceDays.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(d => d.Trim())
                    .ToList();

            string recurrencePattern = GenerateRecurrencePattern(recurringTask);

            return new RecurrantTaskResponse
            {
                Id = recurringTask.Id,
                UserId = recurringTask.UserId,
                ContextId = recurringTask.ContextId,
                ContextName = recurringTask.Context?.Name ?? string.Empty,
                ContextColor = recurringTask.Context?.Color ?? string.Empty,
                Title = recurringTask.Title,
                Description = recurringTask.Description,
                EstimatedMinutes = recurringTask.EstimatedMinutes,
                Priority = recurringTask.Priority,
                RecurrenceType = recurringTask.RecurrenceType,
                RecurrenceDays = recurrenceDaysList,
                RecurrenceStartDate = recurringTask.RecurrenceStartDate,
                RecurrenceEndDate = recurringTask.RecurrenceEndDate,
                CreatedAt = recurringTask.CreatedAt,
                UpdatedAt = recurringTask.UpdatedAt,
                IsActive = recurringTask.IsActive,
                InstanceCount = recurringTask.Tasks?.Count ?? 0,
                RecurrencePattern = recurrencePattern
            };
        }

        private string GenerateRecurrencePattern(RecurrantTask recurringTask)
        {
            var pattern = recurringTask.RecurrenceType switch
            {
                RecurrenceType.Daily => "Daily",
                RecurrenceType.Weekly => "Weekly",
                RecurrenceType.Biweekly => "Every 2 weeks",
                RecurrenceType.Monthly => "Monthly",
                RecurrenceType.Custom => GenerateCustomPattern(recurringTask.RecurrenceDays),
                _ => "Unknown"
            };

            var startInfo = $"starting {recurringTask.RecurrenceStartDate:MMM dd, yyyy}";
            var endInfo = recurringTask.RecurrenceEndDate.HasValue
                ? $" until {recurringTask.RecurrenceEndDate.Value:MMM dd, yyyy}"
                : "";

            return $"{pattern} ({startInfo}{endInfo})";
        }

        private string GenerateCustomPattern(string recurrenceDays)
        {
            if (string.IsNullOrEmpty(recurrenceDays))
            {
                return "Custom";
            }

            var days = recurrenceDays.Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(d => d.Trim())
                .ToList();

            if (days.Count == 0)
            {
                return "Custom";
            }

            var dayMap = new Dictionary<string, string>
            {
                { "Mon", "Monday" },
                { "Tue", "Tuesday" },
                { "Wed", "Wednesday" },
                { "Thu", "Thursday" },
                { "Fri", "Friday" },
                { "Sat", "Saturday" },
                { "Sun", "Sunday" }
            };

            var fullDayNames = days.Select(d => dayMap.ContainsKey(d) ? dayMap[d] : d).ToList();

            if (fullDayNames.Count == 1)
            {
                return $"Every {fullDayNames[0]}";
            }
            else if (fullDayNames.Count == 2)
            {
                return $"Every {fullDayNames[0]} and {fullDayNames[1]}";
            }
            else
            {
                var lastDay = fullDayNames.Last();
                var otherDays = string.Join(", ", fullDayNames.Take(fullDayNames.Count - 1));
                return $"Every {otherDays}, and {lastDay}";
            }
        }    }
}