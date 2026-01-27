using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.Models;
using ContextManager.API.DTOs;

namespace ContextManager.API.Services
{

    /// handles creation, retrieval, and user customization of daily task schedules
    public class SessionPlanService
    {
        private readonly ApplicationDbContext _context;
        private readonly ClaudeService _claudeService;

        public SessionPlanService(ApplicationDbContext context, ClaudeService claudeService)
        {
            _context = context;
            _claudeService = claudeService;
        }

        /// generates a new session plan for a specific date
        public async Task<SessionPlanResponse> GenerateSessionPlanAsync(Guid userId, DateTime planDate)
        {
            planDate = DateTime.SpecifyKind(planDate.Date, DateTimeKind.Utc);
            
            var existingPlan = await _context.SessionPlans
                .Include(sp => sp.Items)
                    .ThenInclude(spi => spi.Task)
                .FirstOrDefaultAsync(sp => sp.UserId == userId && sp.PlanDate == planDate);
            
            var recurringInstances = existingPlan?.Items
                .Where(spi => spi.Task.IsRecurringInstance)
                .Select(spi => spi.Task)
                .ToList() ?? new List<Models.Task>();
            
            if (existingPlan != null)
            {
                _context.SessionPlans.Remove(existingPlan);
                await _context.SaveChangesAsync();
            }
            
            var aiPlan = await _claudeService.GetSessionPlanAsync(userId, planDate);
            
            if (aiPlan.Items == null || !aiPlan.Items.Any())
            {
                throw new InvalidOperationException("No pending tasks available to create a session plan");
            }
            
            var sessionPlan = new SessionPlan
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PlanDate = planDate,
                CreatedAt = DateTime.UtcNow,
                IsCustomized = false
            };
            
            // recurring instances first
            int order = 0;
            int groupNumber = 0;
            Guid? lastContextId = null;
            
            var recurringByContext = recurringInstances
                .GroupBy(t => t.ContextId)
                .OrderBy(g => g.Key)
                .ToList();
            
            foreach (var contextGroup in recurringByContext)
            {
                if (lastContextId.HasValue && lastContextId.Value != contextGroup.Key)
                {
                    groupNumber++;
                }
                lastContextId = contextGroup.Key;
                
                foreach (var task in contextGroup.OrderByDescending(t => t.Priority))
                {
                    var planItem = new SessionPlanItem
                    {
                        Id = Guid.NewGuid(),
                        SessionPlanId = sessionPlan.Id,
                        TaskId = task.Id,
                        Order = order++,
                        GroupNumber = groupNumber,
                        Reasoning = "Recurring task - must not be missed"
                    };
                    sessionPlan.Items.Add(planItem);
                }
            }
            
            for (int i = 0; i < aiPlan.Items.Count; i++)
            {
                var item = aiPlan.Items[i];
                
                if (lastContextId.HasValue && lastContextId.Value != item.Task.ContextId)
                {
                    groupNumber++;
                }
                lastContextId = item.Task.ContextId;
                
                var planItem = new SessionPlanItem
                {
                    Id = Guid.NewGuid(),
                    SessionPlanId = sessionPlan.Id,
                    TaskId = item.Task.Id,
                    Order = order++,
                    GroupNumber = groupNumber,
                    Reasoning = item.Reasoning
                };
                
                sessionPlan.Items.Add(planItem);
            }
            
            _context.SessionPlans.Add(sessionPlan);
            await _context.SaveChangesAsync();

            var result = await GetSessionPlanAsync(userId, planDate);
            return result ?? throw new InvalidOperationException("Failed to retrieve generated session plan");
        }

        public async Task<SessionPlanResponse?> GetSessionPlanAsync(Guid userId, DateTime planDate)
        {
            planDate = DateTime.SpecifyKind(planDate.Date, DateTimeKind.Utc);
            
            var sessionPlan = await _context.SessionPlans
                .Include(sp => sp.Items)
                    .ThenInclude(spi => spi.Task)
                        .ThenInclude(t => t.Context)
                .FirstOrDefaultAsync(sp => sp.UserId == userId && sp.PlanDate == planDate);
            
            if (sessionPlan == null)
            {
                return null;
            }
            
            var allItems = sessionPlan.Items.OrderBy(spi => spi.Order).ToList();
            var activeItems = allItems.Where(spi => spi.Task.Status != Models.TaskStatus.Completed).ToList();
            var completedItems = allItems.Where(spi => spi.Task.Status == Models.TaskStatus.Completed).ToList();
            
            // start/end times only for active tasks
            var currentTime = new TimeSpan(9, 0, 0); //start at 9 AM
            var itemsWithTimes = new List<SessionPlanItemResponse>();
            
            foreach (var spi in activeItems)
            {
                var startTime = currentTime;
                var endTime = currentTime.Add(TimeSpan.FromMinutes(spi.Task.EstimatedMinutes));
                
                // ensure we don't exceed 5 PM
                var maxTime = new TimeSpan(17, 0, 0);
                if (endTime > maxTime)
                {
                    endTime = maxTime;
                }
                
                currentTime = endTime;
                
                itemsWithTimes.Add(new SessionPlanItemResponse
                {
                    Id = spi.Id,
                    Task = MapTaskToDTO(spi.Task),
                    Order = spi.Order,
                    GroupNumber = spi.GroupNumber,
                    Reasoning = spi.Reasoning,
                    StartTime = FormatTime(startTime),
                    EndTime = FormatTime(endTime)
                });
            }
            
            foreach (var spi in completedItems)
            {
                itemsWithTimes.Add(new SessionPlanItemResponse
                {
                    Id = spi.Id,
                    Task = MapTaskToDTO(spi.Task),
                    Order = spi.Order,
                    GroupNumber = spi.GroupNumber,
                    Reasoning = spi.Reasoning,
                    StartTime = string.Empty,
                    EndTime = string.Empty
                });
            }
            var totalEstimatedMinutes = activeItems.Sum(spi => spi.Task.EstimatedMinutes);
            
            var response = new SessionPlanResponse
            {
                Id = sessionPlan.Id,
                PlanDate = sessionPlan.PlanDate,
                CreatedAt = sessionPlan.CreatedAt,
                LastModifiedAt = sessionPlan.LastModifiedAt,
                IsCustomized = sessionPlan.IsCustomized,
                Items = itemsWithTimes,
                TotalEstimatedMinutes = totalEstimatedMinutes // only count active tasks
            };
            
            return response;
        }
        
        private string FormatTime(TimeSpan time)
        {
            var hours = time.Hours;
            var minutes = time.Minutes;
            var period = hours >= 12 ? "PM" : "AM";
            
            if (hours > 12) hours -= 12;
            if (hours == 0) hours = 12;
            
            return $"{hours}:{minutes:D2} {period}";
        }

        /// updates the order of tasks in a session plan based on user drag-and-drop
        public async Task<SessionPlanResponse> UpdateSessionPlanOrderAsync(Guid userId, Guid sessionPlanId, List<Guid> taskIds)
        {
            var sessionPlan = await _context.SessionPlans
                .Include(sp => sp.Items)
                .ThenInclude(spi => spi.Task)
                .FirstOrDefaultAsync(sp => sp.Id == sessionPlanId && sp.UserId == userId);
            
            if (sessionPlan == null)
            {
                throw new InvalidOperationException("Session plan not found");
            }
            
            // remove items that are not in the taskIds list (user removed them)
            var itemsToRemove = sessionPlan.Items.Where(spi => !taskIds.Contains(spi.TaskId)).ToList();
            foreach (var item in itemsToRemove)
            {
                _context.SessionPlanItems.Remove(item);
            }
            
            // update order of remaining items based on taskIds array
            for (int i = 0; i < taskIds.Count; i++)
            {
                var item = sessionPlan.Items.FirstOrDefault(spi => spi.TaskId == taskIds[i]);
                if (item != null)
                {
                    item.Order = i;
                }
            }
            
            var orderedItems = sessionPlan.Items
                .Where(spi => taskIds.Contains(spi.TaskId))
                .OrderBy(spi => spi.Order)
                .ToList();
            int groupNumber = 0;
            Guid? lastContextId = null;
            
            foreach (var item in orderedItems)
            {
                if (lastContextId.HasValue && lastContextId.Value != item.Task.ContextId)
                {
                    groupNumber++;
                }
                item.GroupNumber = groupNumber;
                lastContextId = item.Task.ContextId;
            }
            
            sessionPlan.IsCustomized = true;
            sessionPlan.LastModifiedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return await GetSessionPlanAsync(userId, sessionPlan.PlanDate) 
                ?? throw new InvalidOperationException("Failed to retrieve updated session plan");
        }

        public async Task<List<SessionPlanResponse>> GetSessionPlansInRangeAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            startDate = DateTime.SpecifyKind(startDate.Date, DateTimeKind.Utc);
            endDate = DateTime.SpecifyKind(endDate.Date, DateTimeKind.Utc);
            
            var sessionPlans = await _context.SessionPlans
                .Include(sp => sp.Items)
                    .ThenInclude(spi => spi.Task)
                        .ThenInclude(t => t.Context)
                .Where(sp => sp.UserId == userId && sp.PlanDate >= startDate && sp.PlanDate <= endDate)
                .OrderBy(sp => sp.PlanDate)
                .ToListAsync();
            
            return sessionPlans.Select(sp => new SessionPlanResponse
            {
                Id = sp.Id,
                PlanDate = sp.PlanDate,
                CreatedAt = sp.CreatedAt,
                LastModifiedAt = sp.LastModifiedAt,
                IsCustomized = sp.IsCustomized,
                Items = sp.Items
                    .OrderBy(spi => spi.Order)
                    .Select(spi => new SessionPlanItemResponse
                    {
                        Id = spi.Id,
                        Task = MapTaskToDTO(spi.Task),
                        Order = spi.Order,
                        GroupNumber = spi.GroupNumber,
                        Reasoning = spi.Reasoning
                    })
                    .ToList(),
                TotalEstimatedMinutes = sp.Items.Sum(spi => spi.Task.EstimatedMinutes)
            }).ToList();
        }

        /// helper method to map Task entity to TaskResponse
        private TaskResponse MapTaskToDTO(Models.Task task)
        {
            if (task == null)
            {
                throw new ArgumentNullException(nameof(task));
            }

            return new TaskResponse
            {
                Id = task.Id,
                UserId = task.UserId,
                ContextId = task.ContextId,
                ContextName = task.Context?.Name ?? "",
                ContextColor = task.Context?.Color ?? "",
                Title = task.Title ?? "",
                Description = task.Description ?? "",
                EstimatedMinutes = task.EstimatedMinutes,
                Priority = task.Priority,
                Status = task.Status,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                CompletedAt = task.CompletedAt
            };
        }
    }
}

