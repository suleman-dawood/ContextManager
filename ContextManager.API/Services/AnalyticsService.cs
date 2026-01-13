using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Models;

namespace ContextManager.API.Services
{
    public class AnalyticsService
    {
        private readonly ApplicationDbContext _db;

        public AnalyticsService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<ContextDistributionResponse>> GetContextDistributionAsync(Guid userId, bool activeOnly = false)
        {
            var query = _db.Tasks.Where(t => t.UserId == userId);
            
            if (activeOnly)
            {
                query = query.Where(t => t.Status != Models.TaskStatus.Completed);
            }
            
            return await query
                .GroupBy(t => t.Context)
                .Select(g => new ContextDistributionResponse
                {
                    Context = g.Key.Name,
                    Color = g.Key.Color,
                    Count = g.Count()
                })
                .ToListAsync();
        }

        public async Task<List<CompletionRateResponse>> GetCompletionRateAsync(Guid userId)
        {
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7).Date;

            var tasks = await _db.Tasks
                .Where(t => t.UserId == userId && 
                    (t.CompletedAt >= sevenDaysAgo || 
                     (t.DueDate.HasValue && t.DueDate.Value >= sevenDaysAgo)))
                .ToListAsync();

            return Enumerable.Range(0, 7)
                .Select(offset =>
                {
                    var date = DateTime.UtcNow.AddDays(-6 + offset).Date;
                    
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
        }
    }
}

