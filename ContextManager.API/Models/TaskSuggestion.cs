using System;

namespace ContextManager.API.Models
{
    /// <summary>
    /// Represents an AI-generated task suggestion from Claude
    /// Stores the history of suggestions and user feedback for learning
    /// </summary>
    public class TaskSuggestion
    {
        /// <summary>
        /// Unique identifier for the suggestion
        /// </summary>
        public Guid Id { get; set; }
        
        /// <summary>
        /// ID of the user who received this suggestion
        /// </summary>
        public Guid UserId { get; set; }
        
        /// <summary>
        /// ID of the task that was suggested
        /// </summary>
        public Guid TaskId { get; set; }
        
        /// <summary>
        /// ID of the context the suggestion was for
        /// </summary>
        public Guid ContextId { get; set; }
        
        /// <summary>
        /// AI confidence score (0.0 to 1.0) for the suggestion
        /// </summary>
        public float ConfidenceScore { get; set; }
        
        /// <summary>
        /// Claude's explanation for why this task was suggested
        /// </summary>
        public string Reasoning { get; set; } = string.Empty;
        
        /// <summary>
        /// When the suggestion was generated
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// User feedback: true = accepted/helpful, false = rejected/not helpful, null = no feedback yet
        /// </summary>
        public bool? UserAccepted { get; set; }
        
        // Navigation properties for Entity Framework relationships
        public User User { get; set; } = null!;
        public Task Task { get; set; } = null!;
        public Context Context { get; set; } = null!;
    }
}

