using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ContextManager.API.DTOs;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly AnalyticsService _analyticsService;
        private readonly AuthService _authService;

        public AnalyticsController(AnalyticsService analyticsService, AuthService authService)
        {
            _analyticsService = analyticsService;
            _authService = authService;
        }

        [HttpGet("context-distribution")]
        public async Task<ActionResult<List<ContextDistributionResponse>>> GetContextDistribution([FromQuery] bool activeOnly = false)
        {
            var userId = _authService.GetUserIdFromClaims(User);
            var distribution = await _analyticsService.GetContextDistributionAsync(userId, activeOnly);
            return Ok(distribution);
        }

        [HttpGet("completion-rate")]
        public async Task<ActionResult<List<CompletionRateResponse>>> GetCompletionRate()
        {
            var userId = _authService.GetUserIdFromClaims(User);
            var completionData = await _analyticsService.GetCompletionRateAsync(userId);
            return Ok(completionData);
        }
    }
}
