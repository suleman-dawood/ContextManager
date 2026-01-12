using System;

namespace ContextManager.API.Models
{
    /// <summary>
    /// Represents a mental context or mode of work (e.g., Deep Work, Meetings)
    /// These are pre-seeded in the database and read-only
    /// </summary>
    public class Context
    {
        /// <summary>
        /// Unique identifier for the context
        /// </summary>
        public Guid Id { get; set; }
        
        /// <summary>
        /// Name of the context (e.g., "Deep Work", "Meetings")
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Description of what activities fit this context
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// Hex color code for UI display (e.g., "#3B82F6")
        /// </summary>
        public string Color { get; set; } = string.Empty;
        
        /// <summary>
        /// Icon name for UI display (e.g., "brain", "users")
        /// </summary>
        public string Icon { get; set; } = string.Empty;
    }
}

