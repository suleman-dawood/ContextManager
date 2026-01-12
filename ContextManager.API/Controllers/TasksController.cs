using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Models;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    /// <summary>
    /// Handles CRUD operations for tasks
    /// All endpoints require authentication
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly AuthService _authService;

        public TasksController(ApplicationDbContext db, AuthService authService)
        {
            _db = db;
            _authService = authService;
        }

        /// <summary>
        /// Get all tasks for the authenticated user
        /// GET /api/tasks?contextId={guid}&status={status}
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<TaskResponse>>> GetTasks(
            [FromQuery] Guid? contextId, 
            [FromQuery] TaskStatus? status)
        {
            var userId = _authService.GetUserIdFromClaims(User);

            // Build query with optional filters
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

            var tasks = await query
                .OrderBy(t => t.Status)
                .ThenBy(t => t.DueDate)
                .ThenByDescending(t => t.Priority)
                .ToListAsync();

            // Map to response DTOs
            var response = tasks.Select(t => new TaskResponse
            {
                Id = t.Id,
                UserId = t.UserId,
                ContextId = t.ContextId,
                ContextName = t.Context.Name,
                ContextColor = t.Context.Color,
                Title = t.Title,
                Description = t.Description,
                EstimatedMinutes = t.EstimatedMinutes,
                Priority = t.Priority,
                Status = t.Status,
                DueDate = t.DueDate,
                CreatedAt = t.CreatedAt,
                CompletedAt = t.CompletedAt
            }).ToList();

            return Ok(response);
        }

        /// <summary>
        /// Get a single task by ID
        /// GET /api/tasks/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskResponse>> GetTask(Guid id)
        {
            var userId = _authService.GetUserIdFromClaims(User);

            var task = await _db.Tasks
                .Include(t => t.Context)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
            {
                return NotFound(new { message = "Task not found" });
            }

            return Ok(new TaskResponse
            {
                Id = task.Id,
                UserId = task.UserId,
                ContextId = task.ContextId,
                ContextName = task.Context.Name,
                ContextColor = task.Context.Color,
                Title = task.Title,
                Description = task.Description,
                EstimatedMinutes = task.EstimatedMinutes,
                Priority = task.Priority,
                Status = task.Status,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                CompletedAt = task.CompletedAt
            });
        }

        /// <summary>
        /// Create a new task
        /// POST /api/tasks
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<TaskResponse>> CreateTask([FromBody] CreateTaskRequest request)
        {
            var userId = _authService.GetUserIdFromClaims(User);

            // Validate context exists
            var contextExists = await _db.Contexts.AnyAsync(c => c.Id == request.ContextId);
            if (!contextExists)
            {
                return BadRequest(new { message = "Invalid context ID" });
            }

            var task = new Models.Task
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ContextId = request.ContextId,
                Title = request.Title,
                Description = request.Description,
                EstimatedMinutes = request.EstimatedMinutes,
                Priority = request.Priority,
                Status = TaskStatus.Todo,
                DueDate = request.DueDate,
                CreatedAt = DateTime.UtcNow
            };

            _db.Tasks.Add(task);
            await _db.SaveChangesAsync();

            // Load context for response
            await _db.Entry(task).Reference(t => t.Context).LoadAsync();

            return CreatedAtAction(
                nameof(GetTask),
                new { id = task.Id },
                new TaskResponse
                {
                    Id = task.Id,
                    UserId = task.UserId,
                    ContextId = task.ContextId,
                    ContextName = task.Context.Name,
                    ContextColor = task.Context.Color,
                    Title = task.Title,
                    Description = task.Description,
                    EstimatedMinutes = task.EstimatedMinutes,
                    Priority = task.Priority,
                    Status = task.Status,
                    DueDate = task.DueDate,
                    CreatedAt = task.CreatedAt,
                    CompletedAt = task.CompletedAt
                });
        }

        /// <summary>
        /// Update an existing task
        /// PUT /api/tasks/{id}
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<TaskResponse>> UpdateTask(Guid id, [FromBody] UpdateTaskRequest request)
        {
            var userId = _authService.GetUserIdFromClaims(User);

            var task = await _db.Tasks
                .Include(t => t.Context)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
            {
                return NotFound(new { message = "Task not found" });
            }

            // Update fields
            task.Title = request.Title;
            task.Description = request.Description;
            task.EstimatedMinutes = request.EstimatedMinutes;
            task.Priority = request.Priority;
            task.Status = request.Status;
            task.DueDate = request.DueDate;

            // If status changed to Completed, set completion time
            if (request.Status == TaskStatus.Completed && task.CompletedAt == null)
            {
                task.CompletedAt = DateTime.UtcNow;
            }
            // If status changed from Completed to something else, clear completion time
            else if (request.Status != TaskStatus.Completed && task.CompletedAt != null)
            {
                task.CompletedAt = null;
            }

            await _db.SaveChangesAsync();

            return Ok(new TaskResponse
            {
                Id = task.Id,
                UserId = task.UserId,
                ContextId = task.ContextId,
                ContextName = task.Context.Name,
                ContextColor = task.Context.Color,
                Title = task.Title,
                Description = task.Description,
                EstimatedMinutes = task.EstimatedMinutes,
                Priority = task.Priority,
                Status = task.Status,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                CompletedAt = task.CompletedAt
            });
        }

        /// <summary>
        /// Delete a task
        /// DELETE /api/tasks/{id}
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var userId = _authService.GetUserIdFromClaims(User);

            var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
            {
                return NotFound(new { message = "Task not found" });
            }

            _db.Tasks.Remove(task);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}

