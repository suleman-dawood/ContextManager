using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ContextManager.API.DTOs;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SuggestionsController : ControllerBase
    {
        private readonly ClaudeService _claudeService;

        public SuggestionsController(ClaudeService claudeService)
        {
            _claudeService = claudeService;
        }

        /// POST /api/suggestions/categorize
        [HttpPost("categorize")]
        public async Task<ActionResult<ContextCategorizationResponse>> CategorizeTask([FromBody] CategorizeTaskRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest(new { message = "Task title is required" });
            }

            try
            {
                var categorization = await _claudeService.CategorizeTaskAsync(request.Title, request.Description ?? "");
                return Ok(categorization);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, new { message = "AI service unavailable", error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to categorize task", error = ex.Message });
            }
        }

        /// POST /api/suggestions/task-from-natural-language
        [HttpPost("task-from-natural-language")]
        public async Task<ActionResult<TaskFromNaturalLanguageResponse>> GetTaskFromNaturalLanguage([FromBody] TaskFromNaturalLanguageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.NaturalLanguage))
            {
                return BadRequest(new { message = "Missing input" });
            }

            try
            {
                var task = await _claudeService.GetTaskFromNaturalLanguageAsync(request.NaturalLanguage);
                return Ok(task);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, new { message = "AI service unavailable", error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get task from natural language", error = ex.Message });
            }
        }
    }
}
