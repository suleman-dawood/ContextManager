using System;

namespace ContextManager.API.Models
{
    /// <summary>
    /// Represents a registered user in the system
    /// </summary>
    public class User
    {
        /// <summary>
        /// Unique identifier for the user
        /// </summary>
        public Guid Id { get; set; }
        
        /// <summary>
        /// User's email address (used for login)
        /// </summary>
        public string Email { get; set; } = string.Empty;
        
        /// <summary>
        /// User's display name
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Hashed password (never store plain text!)
        /// </summary>
        public string PasswordHash { get; set; } = string.Empty;
        
        /// <summary>
        /// When the user account was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}

