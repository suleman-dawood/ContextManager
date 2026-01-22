using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Models;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly AuthService _authService;

        public AuthController(ApplicationDbContext db, AuthService authService)
        {
            _db = db;
            _authService = authService;
        }

        /// POST /api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || 
                string.IsNullOrWhiteSpace(request.Password) || 
                string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "All fields are required" });
            }

            var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already registered" });
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Name = request.Name,
                PasswordHash = _authService.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var defaultContexts = new List<Context>
            {
                new Context
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Name = "Deep Work",
                    Description = "Complex problem-solving, coding, writing, research",
                    Color = "#3B82F6",
                    Icon = "brain"
                },
                new Context
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Name = "Meetings",
                    Description = "Collaborative sessions, discussions, video calls",
                    Color = "#10B981",
                    Icon = "users"
                },
                new Context
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Name = "Admin",
                    Description = "Email management, scheduling, documentation, planning",
                    Color = "#F59E0B",
                    Icon = "clipboard"
                },
                new Context
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Name = "Creative",
                    Description = "Brainstorming, design, prototyping, experimentation",
                    Color = "#8B5CF6",
                    Icon = "palette"
                },
                new Context
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Name = "Learning",
                    Description = "Reading, courses, tutorials, skill development",
                    Color = "#EC4899",
                    Icon = "book"
                }
            };
            _db.Contexts.AddRange(defaultContexts);
            await _db.SaveChangesAsync();

            var token = _authService.GenerateJwtToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                Name = user.Name
            });
        }

        /// POST /api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            if (!_authService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token = _authService.GenerateJwtToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                Name = user.Name
            });
        }
    }
}

