using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Services;
using TaskStatus = ContextManager.API.Models.TaskStatus;

namespace ContextManager.API.Controllers
{
    /// <summary>
    /// API controller for task management
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
        /// Gets count of pending tasks for a user
        /// GET /api/tasks/count
        /// </summary>
        [HttpGet("count")]
        public async Task<ActionResult<object>> GetPendingTasksCount()
        {
            var userId = _authService.GetUserIdFromClaims(User);
            
            var count = await _db.Tasks
                .Where(t => t.UserId == userId && t.Status != TaskStatus.Completed)
                .CountAsync();
            
            return Ok(new { count });
        }

        /// <summary>
        /// Gets all tasks with optional filtering
        /// GET /api/tasks
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<TaskResponse>>> GetTasks(
            [FromQuery] Guid? contextId = null,
            [FromQuery] TaskStatus? status = null)
        {
            var userId = _authService.GetUserIdFromClaims(User);
            
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
            
            var response = tasks.Select(t => new TaskResponse
            {
                Id = t.Id,
                UserId = t.UserId,
                ContextId = t.ContextId,
                ContextName = t.Context?.Name ?? "",
                ContextColor = t.Context?.Color ?? "",
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
        /// Gets a single task by ID
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
            
            var response = new TaskResponse
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
            
            return Ok(response);
        }

        /// <summary>
        /// Creates a new task
        /// POST /api/tasks
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<TaskResponse>> CreateTask([FromBody] CreateTaskRequest request)
        {
            var userId = _authService.GetUserIdFromClaims(User);
            
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
            
            var context = await _db.Contexts.FindAsync(request.ContextId);
            
            var response = new TaskResponse
            {
                Id = task.Id,
                UserId = task.UserId,
                ContextId = task.ContextId,
                ContextName = context?.Name ?? "",
                ContextColor = context?.Color ?? "",
                Title = task.Title,
                Description = task.Description,
                EstimatedMinutes = task.EstimatedMinutes,
                Priority = task.Priority,
                Status = task.Status,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                CompletedAt = task.CompletedAt
            };
            
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, response);
        }

        /// <summary>
        /// Updates an existing task
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
            
            task.ContextId = request.ContextId;
            task.Title = request.Title;
            task.Description = request.Description;
            task.EstimatedMinutes = request.EstimatedMinutes;
            task.Priority = request.Priority;
            task.Status = request.Status;
            task.DueDate = request.DueDate;
            
            if (request.Status == TaskStatus.Completed && task.CompletedAt == null)
            {
                task.CompletedAt = DateTime.UtcNow;
            }
            else if (request.Status != TaskStatus.Completed)
            {
                task.CompletedAt = null;
            }
            
            await _db.SaveChangesAsync();
            
            var response = new TaskResponse
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
            
            return Ok(response);
        }

        /// <summary>
        /// Deletes a task
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
