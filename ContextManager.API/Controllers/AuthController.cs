using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Models;
using ContextManager.API.Services;

namespace ContextManager.API.Controllers
{
    /// <summary>
    /// Handles user authentication (registration and login)
    /// </summary>
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

        /// <summary>
        /// Register a new user account
        /// POST /api/auth/register
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email) || 
                string.IsNullOrWhiteSpace(request.Password) || 
                string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "All fields are required" });
            }

            // Check if user already exists
            var existingUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already registered" });
            }

            // Create new user
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

            // Generate JWT token
            var token = _authService.GenerateJwtToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                Name = user.Name
            });
        }

        /// <summary>
        /// Login with existing credentials
        /// POST /api/auth/login
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            // Find user by email
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Verify password
            if (!_authService.VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Generate JWT token
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

