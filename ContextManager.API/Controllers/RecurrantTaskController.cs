using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ContextManager.API.DTOs;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    [ApiController]
    [Route("api/recurring-tasks")]
    [Authorize]
    public class RecurrantTaskController : ControllerBase
    {
        private readonly RecurrantTaskService _recurrantTaskService;
        private readonly AuthService _authService;

        public RecurrantTaskController(RecurrantTaskService recurrantTaskService, AuthService authService)
        {
            _recurrantTaskService = recurrantTaskService;
            _authService = authService;
        }

        [HttpPost]
        public async Task<ActionResult<RecurrantTaskResponse>> CreateRecurrantTask([FromBody] CreateRecurrantTaskRequest request)
        {
            try
            {
                var userId = _authService.GetUserIdFromClaims(User);
                var recurrantTask = await _recurrantTaskService.CreateRecurrantTaskAsync(userId, request);
                return CreatedAtAction(nameof(GetRecurrantTask), new { id = recurrantTask.Id }, recurrantTask);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create recurring task", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RecurrantTaskResponse>> UpdateRecurrantTask(Guid id, [FromBody] UpdateRecurrantTaskRequest request)
        {
            try
            {
                var userId = _authService.GetUserIdFromClaims(User);
                var recurrantTask = await _recurrantTaskService.UpdateRecurrantTaskAsync(userId, id, request);
                return Ok(recurrantTask);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update recurring task", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecurrantTask(Guid id)
        {
            try
            {
                var userId = _authService.GetUserIdFromClaims(User);
                await _recurrantTaskService.DeleteRecurrantTaskAsync(userId, id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete recurring task", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RecurrantTaskResponse>> GetRecurrantTask(Guid id)
        {
            try
            {
                var userId = _authService.GetUserIdFromClaims(User);
                var recurrantTask = await _recurrantTaskService.GetRecurrantTaskAsync(userId, id);
                return Ok(recurrantTask);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get recurring task", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<RecurrantTaskResponse>>> GetRecurrantTasks()
        {
            try
            {
                var userId = _authService.GetUserIdFromClaims(User);
                var recurrantTasks = await _recurrantTaskService.GetRecurrantTasksAsync(userId);
                return Ok(recurrantTasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get recurring tasks", error = ex.Message });
            }
        }
    }
}