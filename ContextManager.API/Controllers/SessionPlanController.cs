using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using ContextManager.API.DTOs;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    /// <summary>
    /// API controller for managing AI-powered session plans
    /// Handles generation, retrieval, and customization of daily task schedules
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SessionPlanController : ControllerBase
    {
        private readonly SessionPlanService _sessionPlanService;

        public SessionPlanController(SessionPlanService sessionPlanService)
        {
            _sessionPlanService = sessionPlanService;
        }

        /// <summary>
        /// Generates a new AI-powered session plan for a specific date
        /// POST /api/sessionplan/generate
        /// </summary>
        [HttpPost("generate")]
        public async Task<ActionResult<SessionPlanResponse>> GenerateSessionPlan([FromBody] GenerateSessionPlanRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var sessionPlan = await _sessionPlanService.GenerateSessionPlanAsync(userId, request.PlanDate);
                return Ok(sessionPlan);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to generate session plan", error = ex.Message });
            }
        }

        /// <summary>
        /// Gets an existing session plan for a specific date
        /// GET /api/sessionplan?date=2024-01-15
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<SessionPlanResponse>> GetSessionPlan([FromQuery] DateTime date)
        {
            try
            {
                var userId = GetCurrentUserId();
                var sessionPlan = await _sessionPlanService.GetSessionPlanAsync(userId, date);
                
                if (sessionPlan == null)
                {
                    return NotFound(new { message = "No session plan found for this date" });
                }
                
                return Ok(sessionPlan);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve session plan", error = ex.Message });
            }
        }

        /// <summary>
        /// Gets all session plans within a date range
        /// GET /api/sessionplan/range?startDate=2024-01-01&endDate=2024-01-31
        /// </summary>
        [HttpGet("range")]
        public async Task<ActionResult<List<SessionPlanResponse>>> GetSessionPlansInRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            try
            {
                var userId = GetCurrentUserId();
                var sessionPlans = await _sessionPlanService.GetSessionPlansInRangeAsync(userId, startDate, endDate);
                return Ok(sessionPlans);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve session plans", error = ex.Message });
            }
        }

        /// <summary>
        /// Updates the order of tasks in a session plan (after user drag-and-drop)
        /// PUT /api/sessionplan/{id}/order
        /// </summary>
        [HttpPut("{id}/order")]
        public async Task<ActionResult<SessionPlanResponse>> UpdateSessionPlanOrder(
            Guid id, 
            [FromBody] UpdateSessionPlanOrderRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var sessionPlan = await _sessionPlanService.UpdateSessionPlanOrderAsync(userId, id, request.TaskIds);
                return Ok(sessionPlan);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update session plan order", error = ex.Message });
            }
        }

        /// <summary>
        /// Helper method to extract user ID from JWT token claims
        /// </summary>
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return Guid.Parse(userIdClaim);
        }
    }
}

