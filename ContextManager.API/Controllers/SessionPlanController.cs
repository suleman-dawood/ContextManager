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

        /// POST /api/sessionplan/generate
        [HttpPost("generate")]
        public async Task<ActionResult<SessionPlanResponse>> GenerateSessionPlan([FromBody] GenerateSessionPlanRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var planDate = request.PlanDate.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(request.PlanDate, DateTimeKind.Utc)
                    : request.PlanDate.ToUniversalTime();
                var sessionPlan = await _sessionPlanService.GenerateSessionPlanAsync(userId, planDate);
                return Ok(sessionPlan);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, new { message = "AI service unavailable", error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to generate session plan", error = ex.Message });
            }
        }

        /// GET /api/sessionplan?date=2024-01-15
        [HttpGet]
        public async Task<ActionResult<SessionPlanResponse>> GetSessionPlan([FromQuery] DateTime date)
        {
            try
            {
                var userId = GetCurrentUserId();
                var planDate = date.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(date, DateTimeKind.Utc)
                    : date.ToUniversalTime();
                var sessionPlan = await _sessionPlanService.GetSessionPlanAsync(userId, planDate);
                
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

        /// GET /api/sessionplan/range?startDate=2024-01-01&endDate=2024-01-31
        [HttpGet("range")]
        public async Task<ActionResult<List<SessionPlanResponse>>> GetSessionPlansInRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            try
            {
                var userId = GetCurrentUserId();
                var start = startDate.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(startDate, DateTimeKind.Utc)
                    : startDate.ToUniversalTime();
                var end = endDate.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(endDate, DateTimeKind.Utc)
                    : endDate.ToUniversalTime();
                var sessionPlans = await _sessionPlanService.GetSessionPlansInRangeAsync(userId, start, end);
                return Ok(sessionPlans);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve session plans", error = ex.Message });
            }
        }

        /// PUT /api/sessionplan/{id}/order
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

        /// helper method to extract user ID from JWT token claims
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

