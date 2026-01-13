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
    /// <summary>
    /// Service for managing AI-powered session plans
    /// Handles creation, retrieval, and user customization of daily task schedules
    /// </summary>
    public class SessionPlanService
    {
        private readonly ApplicationDbContext _context;
        private readonly ClaudeService _claudeService;

        public SessionPlanService(ApplicationDbContext context, ClaudeService claudeService)
        {
            _context = context;
            _claudeService = claudeService;
        }

        /// <summary>
        /// Generates a new AI-powered session plan for a specific date
        /// If a plan already exists for that date, it will be replaced and its tasks returned to the pool
        /// </summary>
        public async Task<SessionPlanResponse> GenerateSessionPlanAsync(Guid userId, DateTime planDate)
        {
            // Normalize date to start of day in UTC (remove time component and ensure UTC)
            planDate = DateTime.SpecifyKind(planDate.Date, DateTimeKind.Utc);
            
            // Delete existing plan for this date if it exists
            // This returns tasks back to the available pool
            var existingPlan = await _context.SessionPlans
                .Include(sp => sp.Items)
                .FirstOrDefaultAsync(sp => sp.UserId == userId && sp.PlanDate == planDate);
            
            if (existingPlan != null)
            {
                _context.SessionPlans.Remove(existingPlan);
                await _context.SaveChangesAsync();
            }
            
            // Get AI-generated session plan from Claude
            // This will now include tasks that were in the deleted plan
            var aiPlan = await _claudeService.GetSessionPlanAsync(userId);
            
            // Check if there are any tasks to plan
            if (aiPlan.Items == null || !aiPlan.Items.Any())
            {
                throw new InvalidOperationException("No pending tasks available to create a session plan");
            }
            
            // Create new session plan
            var sessionPlan = new SessionPlan
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PlanDate = planDate,
                CreatedAt = DateTime.UtcNow,
                IsCustomized = false
            };
            
            // Group tasks by context for visual grouping
            int groupNumber = 0;
            Guid? lastContextId = null;
            
            // Create session plan items from AI suggestions
            for (int i = 0; i < aiPlan.Items.Count; i++)
            {
                var item = aiPlan.Items[i];
                
                // Increment group number when context changes
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
                    Order = i,
                    GroupNumber = groupNumber,
                    Reasoning = item.Reasoning
                };
                
                sessionPlan.Items.Add(planItem);
            }
            
            // Save to database
            _context.SessionPlans.Add(sessionPlan);
            await _context.SaveChangesAsync();
            
            // Return the created plan
            var result = await GetSessionPlanAsync(userId, planDate);
            return result ?? throw new InvalidOperationException("Failed to retrieve generated session plan");
        }

        /// <summary>
        /// Retrieves an existing session plan for a specific date
        /// Returns null if no plan exists
        /// Automatically filters out completed tasks
        /// </summary>
        public async Task<SessionPlanResponse?> GetSessionPlanAsync(Guid userId, DateTime planDate)
        {
            // Normalize date to start of day in UTC
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
            
            // Filter out completed tasks and remove them from the plan
            var completedItems = sessionPlan.Items
                .Where(spi => spi.Task.Status == Models.TaskStatus.Completed)
                .ToList();
            
            if (completedItems.Any())
            {
                // Remove completed tasks from the plan
                foreach (var item in completedItems)
                {
                    _context.SessionPlanItems.Remove(item);
                    sessionPlan.Items.Remove(item);
                }
                
                // If all tasks were completed, delete the entire plan
                if (!sessionPlan.Items.Any())
                {
                    _context.SessionPlans.Remove(sessionPlan);
                    await _context.SaveChangesAsync();
                    return null;
                }
                
                // Reorder remaining items
                var remainingItems = sessionPlan.Items.OrderBy(spi => spi.Order).ToList();
                for (int i = 0; i < remainingItems.Count; i++)
                {
                    remainingItems[i].Order = i;
                }
                
                // Recalculate group numbers
                int groupNumber = 0;
                Guid? lastContextId = null;
                foreach (var item in remainingItems.OrderBy(spi => spi.Order))
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
            }
            
            // Map to response DTO with calculated start/end times (only non-completed tasks)
            var orderedItems = sessionPlan.Items
                .Where(spi => spi.Task.Status != Models.TaskStatus.Completed)
                .OrderBy(spi => spi.Order)
                .ToList();
            
            var currentTime = new TimeSpan(9, 0, 0); // Start at 9 AM
            
            var itemsWithTimes = orderedItems.Select(spi =>
            {
                var startTime = currentTime;
                var endTime = currentTime.Add(TimeSpan.FromMinutes(spi.Task.EstimatedMinutes));
                
                // Ensure we don't exceed 5 PM (17:00 = 17 hours = 1020 minutes from midnight)
                // 9 AM = 9 * 60 = 540 minutes from midnight
                // 5 PM = 17 * 60 = 1020 minutes from midnight
                var maxTime = new TimeSpan(17, 0, 0);
                if (endTime > maxTime)
                {
                    endTime = maxTime;
                }
                
                currentTime = endTime;
                
                return new SessionPlanItemResponse
                {
                    Id = spi.Id,
                    Task = MapTaskToDTO(spi.Task),
                    Order = spi.Order,
                    GroupNumber = spi.GroupNumber,
                    Reasoning = spi.Reasoning,
                    StartTime = FormatTime(startTime),
                    EndTime = FormatTime(endTime)
                };
            }).ToList();
            
            var response = new SessionPlanResponse
            {
                Id = sessionPlan.Id,
                PlanDate = sessionPlan.PlanDate,
                CreatedAt = sessionPlan.CreatedAt,
                LastModifiedAt = sessionPlan.LastModifiedAt,
                IsCustomized = sessionPlan.IsCustomized,
                Items = itemsWithTimes,
                TotalEstimatedMinutes = itemsWithTimes.Sum(item => item.Task.EstimatedMinutes)
            };
            
            return response;
        }
        
        /// <summary>
        /// Formats a TimeSpan to a readable time string (e.g., "9:00 AM")
        /// </summary>
        private string FormatTime(TimeSpan time)
        {
            var hours = time.Hours;
            var minutes = time.Minutes;
            var period = hours >= 12 ? "PM" : "AM";
            
            if (hours > 12) hours -= 12;
            if (hours == 0) hours = 12;
            
            return $"{hours}:{minutes:D2} {period}";
        }

        /// <summary>
        /// Updates the order of tasks in a session plan based on user drag-and-drop
        /// Marks the plan as customized
        /// </summary>
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
            
            // Remove items that are not in the taskIds list (user removed them)
            var itemsToRemove = sessionPlan.Items.Where(spi => !taskIds.Contains(spi.TaskId)).ToList();
            foreach (var item in itemsToRemove)
            {
                _context.SessionPlanItems.Remove(item);
            }
            
            // Update order of remaining items based on taskIds array
            for (int i = 0; i < taskIds.Count; i++)
            {
                var item = sessionPlan.Items.FirstOrDefault(spi => spi.TaskId == taskIds[i]);
                if (item != null)
                {
                    item.Order = i;
                }
            }
            
            // Recalculate group numbers based on new order (only for remaining items)
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
            
            // Mark as customized
            sessionPlan.IsCustomized = true;
            sessionPlan.LastModifiedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return await GetSessionPlanAsync(userId, sessionPlan.PlanDate) 
                ?? throw new InvalidOperationException("Failed to retrieve updated session plan");
        }

        /// <summary>
        /// Gets all session plans for a user within a date range
        /// Useful for calendar view
        /// </summary>
        public async Task<List<SessionPlanResponse>> GetSessionPlansInRangeAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            // Normalize dates to start of day in UTC
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

        /// <summary>
        /// Helper method to map Task entity to TaskResponse
        /// </summary>
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

