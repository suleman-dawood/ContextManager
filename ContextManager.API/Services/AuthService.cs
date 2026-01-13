using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ContextManager.API.Models;

namespace ContextManager.API.Services
{
    /// <summary>
    /// Handles authentication operations including password hashing and JWT token generation
    /// </summary>
    public class AuthService
    {
        private readonly IConfiguration _configuration;

        public AuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Hashes a plain text password using SHA256
        /// </summary>
        public string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        /// <summary>
        /// Verifies if a plain text password matches a hashed password
        /// </summary>
        public bool VerifyPassword(string password, string passwordHash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput == passwordHash;
        }

        /// <summary>
        /// Generates a JWT token for an authenticated user
        /// Token includes user ID, email, and name as claims
        /// </summary>
        public string GenerateJwtToken(User user)
        {
            // Get JWT secret from environment variable or configuration (must be at least 32 characters)
            var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? _configuration["JwtSettings:Secret"] 
                ?? throw new InvalidOperationException("JWT Secret not configured");
            
            var jwtIssuer = _configuration["JwtSettings:Issuer"] ?? "ContextManager";
            var jwtAudience = _configuration["JwtSettings:Audience"] ?? "ContextManager";

            // Create security key from secret
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Define claims (user information stored in the token)
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique token ID
            };

            // Create the token
            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: credentials
            );

            // Return the serialized token string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Extracts the user ID from the JWT claims in the HTTP context
        /// </summary>
        public Guid GetUserIdFromClaims(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return Guid.Parse(userIdClaim);
        }
    }
}

