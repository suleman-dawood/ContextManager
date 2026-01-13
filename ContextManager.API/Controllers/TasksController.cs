using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ContextManager.API.DTOs;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _taskService;
        private readonly AuthService _authService;

        public TasksController(TaskService taskService, AuthService authService)
        {
            _taskService = taskService;
            _authService = authService;
        }

        [HttpGet("count")]
        public async Task<ActionResult<object>> GetPendingTasksCount()
        {
            var userId = _authService.GetUserIdFromClaims(User);
            var count = await _taskService.GetPendingTasksCountAsync(userId);
            return Ok(new { count });
        }

        [HttpGet]
        public async Task<ActionResult<List<TaskResponse>>> GetTasks(
            [FromQuery] Guid? contextId = null,
            [FromQuery] Models.TaskStatus? status = null)
        {
            var userId = _authService.GetUserIdFromClaims(User);
            var tasks = await _taskService.GetTasksAsync(userId, contextId, status);
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskResponse>> GetTask(Guid id)
        {
            var userId = _authService.GetUserIdFromClaims(User);
            var task = await _taskService.GetTaskAsync(userId, id);

            if (task == null)
            {
                return NotFound(new { message = "Task not found" });
            }

            return Ok(task);
        }

        [HttpPost]
        public async Task<ActionResult<TaskResponse>> CreateTask([FromBody] CreateTaskRequest request)
        {
            try
            {
                var userId = _authService.GetUserIdFromClaims(User);
                var task = await _taskService.CreateTaskAsync(userId, request);
                return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create task", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<TaskResponse>> UpdateTask(Guid id, [FromBody] UpdateTaskRequest request)
        {
            try
            {
                var userId = _authService.GetUserIdFromClaims(User);
                var task = await _taskService.UpdateTaskAsync(userId, id, request);
                return Ok(task);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update task", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            try
            {
                var userId = _authService.GetUserIdFromClaims(User);
                await _taskService.DeleteTaskAsync(userId, id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete task", error = ex.Message });
            }
        }
    }
}
