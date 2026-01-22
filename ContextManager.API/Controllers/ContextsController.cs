using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ContextManager.API.DTOs;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContextsController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly ContextService _contextService;

        public ContextsController(AuthService authService, ContextService contextService)
        {
            _authService = authService;
            _contextService = contextService;
        }

        /// GET /api/contexts
        [HttpGet]
        public async Task<ActionResult<List<ContextResponse>>> GetContexts()
        {
            var userId = _authService.GetUserIdFromClaims(User);
            var contexts = await _contextService.GetContextsAsync(userId);
            return Ok(contexts);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<ContextResponse>> GetContext(Guid id)
        {
            var userId = _authService.GetUserIdFromClaims(User);
            var context = await _contextService.GetContextAsync(userId, id);
            return Ok(context);
        }

        /// POST /api/contexts
        [HttpPost]
        public async Task<ActionResult<ContextResponse>> CreateContext([FromBody] CreateContextRequest request)
        {
            var userId = _authService.GetUserIdFromClaims(User);
            var context = await _contextService.CreateContextAsync(userId, request);
            return CreatedAtAction(nameof(GetContext), new { id = context.Id }, context);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ContextResponse>> UpdateContext(Guid id, [FromBody] UpdateContextRequest request)
        {
            var userId = _authService.GetUserIdFromClaims(User);
            var context = await _contextService.UpdateContextAsync(userId, id, request);
            return Ok(context);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteContext(Guid id)
    {
        var userId = _authService.GetUserIdFromClaims(User);
        await _contextService.DeleteContextAsync(userId, id);
        return NoContent();
    }
    }
}

