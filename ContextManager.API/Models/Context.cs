using System;

namespace ContextManager.API.Models
{
    public class Context
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
    }
}

