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
    /// Provides analytics and insights about user's productivity
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly AuthService _authService;

        public AnalyticsController(ApplicationDbContext db, AuthService authService)
        {
            _db = db;
            _authService = authService;
        }

        /// <summary>
        /// Get task distribution across contexts
        /// GET /api/analytics/context-distribution
        /// </summary>
        [HttpGet("context-distribution")]
        public async Task<ActionResult<List<ContextDistributionResponse>>> GetContextDistribution()
        {
            var userId = _authService.GetUserIdFromClaims(User);

            // Get task counts by context
            var distribution = await _db.Tasks
                .Where(t => t.UserId == userId)
                .GroupBy(t => t.Context)
                .Select(g => new ContextDistributionResponse
                {
                    Context = g.Key.Name,
                    Color = g.Key.Color,
                    Count = g.Count()
                })
                .ToListAsync();

            return Ok(distribution);
        }

        /// <summary>
        /// Get completion rate over the last 7 days
        /// Shows percentage of tasks completed on each day
        /// GET /api/analytics/completion-rate
        /// </summary>
        [HttpGet("completion-rate")]
        public async Task<ActionResult<List<CompletionRateResponse>>> GetCompletionRate()
        {
            var userId = _authService.GetUserIdFromClaims(User);
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7).Date;

            // Get all tasks that were completed or were due in the last 7 days
            var tasks = await _db.Tasks
                .Where(t => t.UserId == userId && 
                    (t.CompletedAt >= sevenDaysAgo || 
                     (t.DueDate.HasValue && t.DueDate.Value >= sevenDaysAgo)))
                .ToListAsync();

            // Calculate average completion rate for each day
            var completionData = Enumerable.Range(0, 7)
                .Select(offset =>
                {
                    var date = DateTime.UtcNow.AddDays(-6 + offset).Date;
                    var nextDay = date.AddDays(1);
                    
                    // Tasks that were due on this day or completed on this day
                    var dayTasks = tasks.Where(t => 
                        (t.DueDate.HasValue && t.DueDate.Value.Date == date) ||
                        (t.CompletedAt.HasValue && t.CompletedAt.Value.Date == date)
                    ).Distinct().ToList();
                    
                    var completedCount = dayTasks.Count(t => t.Status == Models.TaskStatus.Completed);
                    var totalCount = dayTasks.Count;
                    var rate = totalCount > 0 ? (double)completedCount / totalCount * 100 : 0;

                    return new CompletionRateResponse
                    {
                        Date = date.ToString("MMM dd"),
                        Rate = Math.Round(rate, 1),
                        Completed = completedCount,
                        Total = totalCount
                    };
                })
                .ToList();

            return Ok(completionData);
        }
    }
}

