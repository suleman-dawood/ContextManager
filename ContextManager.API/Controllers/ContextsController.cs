using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.Models;

namespace ContextManager.API.Controllers
{
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

        /// GET /api/contexts
        [HttpGet]
        public async Task<ActionResult<List<Context>>> GetContexts()
        {
            var contexts = await _db.Contexts.ToListAsync();
            return Ok(contexts);
        }
    }
}

