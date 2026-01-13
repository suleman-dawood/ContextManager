using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Models;
using TaskModel = ContextManager.API.Models.Task;
using Task = System.Threading.Tasks.Task;

namespace ContextManager.API.Services
{
    public class TaskService
    {
        private readonly ApplicationDbContext _db;

        public TaskService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<int> GetPendingTasksCountAsync(Guid userId)
        {
            var now = DateTime.UtcNow;
            
            var assignedTaskIds = await _db.SessionPlanItems
                .Where(spi => spi.SessionPlan.UserId == userId)
                .Select(spi => spi.TaskId)
                .Distinct()
                .ToListAsync();
            
            return await _db.Tasks
                .Where(t => t.UserId == userId 
                    && t.Status != Models.TaskStatus.Completed
                    && (t.DueDate == null || t.DueDate >= now)
                    && !assignedTaskIds.Contains(t.Id))
                .CountAsync();
        }

        public async Task<List<TaskResponse>> GetTasksAsync(
            Guid userId, 
            Guid? contextId = null, 
            Models.TaskStatus? status = null)
        {
            var query = _db.Tasks
                .Include(t => t.Context)
                .Where(t => t.UserId == userId);

            if (contextId.HasValue)
            {
                query = query.Where(t => t.ContextId == contextId.Value);
            }

            if (status.HasValue)
            {
                query = query.Where(t => t.Status == status.Value);
            }

            var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
            return tasks.Select(MapToDTO).ToList();
        }

        public async Task<TaskResponse?> GetTaskAsync(Guid userId, Guid taskId)
        {
            var task = await _db.Tasks
                .Include(t => t.Context)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

            return task != null ? MapToDTO(task) : null;
        }

        public async Task<TaskResponse> CreateTaskAsync(Guid userId, CreateTaskRequest request)
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

            var task = new TaskModel
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ContextId = request.ContextId,
                Title = request.Title,
                Description = request.Description ?? string.Empty,
                EstimatedMinutes = request.EstimatedMinutes,
                Priority = request.Priority,
                Status = Models.TaskStatus.Todo,
                DueDate = request.DueDate.HasValue 
                    ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) 
                    : (DateTime?)null,
                CreatedAt = DateTime.UtcNow
            };

            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();

            var savedTask = await _db.Tasks
                .Include(t => t.Context)
                .FirstAsync(t => t.Id == task.Id);
            
            return MapToDTO(savedTask);
        }

        public async Task<TaskResponse> UpdateTaskAsync(Guid userId, Guid taskId, UpdateTaskRequest request)
        {
            var task = await _db.Tasks
                .Include(t => t.Context)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

            if (task == null)
            {
                throw new InvalidOperationException("Task not found");
            }

            task.ContextId = request.ContextId;
            task.Title = request.Title;
            task.Description = request.Description;
            task.EstimatedMinutes = request.EstimatedMinutes;
            task.Priority = request.Priority;
            task.Status = request.Status;
            task.DueDate = request.DueDate.HasValue 
                ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) 
                : (DateTime?)null;

            if (request.Status == Models.TaskStatus.Completed && task.CompletedAt == null)
            {
                task.CompletedAt = DateTime.UtcNow;
            }
            else if (request.Status != Models.TaskStatus.Completed)
            {
                task.CompletedAt = null;
            }

            await _db.SaveChangesAsync();

            var updatedTask = await _db.Tasks
                .Include(t => t.Context)
                .FirstAsync(t => t.Id == taskId);
            
            return MapToDTO(updatedTask);
        }

        public async Task DeleteTaskAsync(Guid userId, Guid taskId)
        {
            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

            if (task == null)
            {
                throw new InvalidOperationException("Task not found");
            }

            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();
        }

        private TaskResponse MapToDTO(TaskModel task)
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

