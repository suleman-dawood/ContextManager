using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.Models;

namespace ContextManager.API.Controllers
{
    /// <summary>
    /// Handles operations for contexts (mental modes)
    /// Contexts are pre-seeded and read-only
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContextsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ContextsController(ApplicationDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Get all available contexts
        /// GET /api/contexts
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<Context>>> GetContexts()
        {
            var contexts = await _db.Contexts.ToListAsync();
            return Ok(contexts);
        }
    }
}

