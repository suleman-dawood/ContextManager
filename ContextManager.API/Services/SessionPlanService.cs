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
        /// If a plan already exists for that date, it will be replaced
        /// </summary>
        public async Task<SessionPlanResponse> GenerateSessionPlanAsync(Guid userId, DateTime planDate)
        {
            // Normalize date to start of day (remove time component)
            planDate = planDate.Date;
            
            // Get AI-generated session plan from Claude
            var aiPlan = await _claudeService.GetSessionPlanAsync(userId);
            
            // Delete existing plan for this date if it exists
            var existingPlan = await _context.SessionPlans
                .Include(sp => sp.Items)
                .FirstOrDefaultAsync(sp => sp.UserId == userId && sp.PlanDate == planDate);
            
            if (existingPlan != null)
            {
                _context.SessionPlans.Remove(existingPlan);
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
        /// </summary>
        public async Task<SessionPlanResponse?> GetSessionPlanAsync(Guid userId, DateTime planDate)
        {
            planDate = planDate.Date;
            
            var sessionPlan = await _context.SessionPlans
                .Include(sp => sp.Items)
                    .ThenInclude(spi => spi.Task)
                        .ThenInclude(t => t.Context)
                .Include(sp => sp.Items)
                    .ThenInclude(spi => spi.Task)
                        .ThenInclude(t => t.User)
                .FirstOrDefaultAsync(sp => sp.UserId == userId && sp.PlanDate == planDate);
            
            if (sessionPlan == null)
            {
                return null;
            }
            
            // Map to response DTO
            var response = new SessionPlanResponse
            {
                Id = sessionPlan.Id,
                PlanDate = sessionPlan.PlanDate,
                CreatedAt = sessionPlan.CreatedAt,
                LastModifiedAt = sessionPlan.LastModifiedAt,
                IsCustomized = sessionPlan.IsCustomized,
                Items = sessionPlan.Items
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
                TotalEstimatedMinutes = sessionPlan.Items.Sum(spi => spi.Task.EstimatedMinutes)
            };
            
            return response;
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
            
            // Update order of items based on taskIds array
            for (int i = 0; i < taskIds.Count; i++)
            {
                var item = sessionPlan.Items.FirstOrDefault(spi => spi.TaskId == taskIds[i]);
                if (item != null)
                {
                    item.Order = i;
                }
            }
            
            // Recalculate group numbers based on new order
            var orderedItems = sessionPlan.Items.OrderBy(spi => spi.Order).ToList();
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
            startDate = startDate.Date;
            endDate = endDate.Date;
            
            var sessionPlans = await _context.SessionPlans
                .Include(sp => sp.Items)
                    .ThenInclude(spi => spi.Task)
                        .ThenInclude(t => t.Context)
                .Include(sp => sp.Items)
                    .ThenInclude(spi => spi.Task)
                        .ThenInclude(t => t.User)
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
            return new TaskResponse
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
            };
        }
    }
}

