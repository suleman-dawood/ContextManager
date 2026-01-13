using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    /// <summary>
    /// Handles AI-powered task suggestions (the star feature!)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SuggestionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ClaudeService _claudeService;
        private readonly AuthService _authService;

        public SuggestionsController(
            ApplicationDbContext db, 
            ClaudeService claudeService, 
            AuthService authService)
        {
            _db = db;
            _claudeService = claudeService;
            _authService = authService;
        }

        /// <summary>
        /// Get AI-generated task suggestions for a specific context
        /// GET /api/suggestions?contextId={guid}
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<TaskSuggestionResponse>>> GetSuggestions([FromQuery] Guid contextId)
        {
            var userId = _authService.GetUserIdFromClaims(User);

            // Validate context exists
            var contextExists = await _db.Contexts.AnyAsync(c => c.Id == contextId);
            if (!contextExists)
            {
                return BadRequest(new { message = "Invalid context ID" });
            }

            try
            {
                // Call Claude AI to get suggestions
                var suggestions = await _claudeService.GetSuggestionsAsync(userId, contextId);

                if (!suggestions.Any())
                {
                    return Ok(new List<TaskSuggestionResponse>());
                }

                return Ok(suggestions);
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
                return StatusCode(500, new { message = "Failed to generate suggestions", error = ex.Message });
            }
        }

        /// <summary>
        /// Provide feedback on a suggestion (helps AI learn)
        /// POST /api/suggestions/{id}/feedback
        /// </summary>
        [HttpPost("{id}/feedback")]
        public async Task<IActionResult> ProvideFeedback(Guid id, [FromBody] SuggestionFeedbackRequest request)
        {
            var userId = _authService.GetUserIdFromClaims(User);

            var suggestion = await _db.TaskSuggestions
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (suggestion == null)
            {
                return NotFound(new { message = "Suggestion not found" });
            }

            // Update feedback
            suggestion.UserAccepted = request.Accepted;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Feedback recorded successfully" });
        }
    }
}

