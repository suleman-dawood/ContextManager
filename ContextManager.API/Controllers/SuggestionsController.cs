using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ContextManager.API.DTOs;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    /// <summary>
    /// Handles AI-powered task categorization
    /// </summary>
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

        /// <summary>
        /// AI-powered task categorization - Categorizes a task into the appropriate context
        /// This is the core feature: intelligent task classification using Claude AI
        /// POST /api/suggestions/categorize
        /// </summary>
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
        }
    }
