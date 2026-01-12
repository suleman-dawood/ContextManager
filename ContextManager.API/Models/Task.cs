using System;

namespace ContextManager.API.Models
{
    /// <summary>
    /// Represents a user's task with context classification
    /// </summary>
    public class Task
    {
        /// <summary>
        /// Unique identifier for the task
        /// </summary>
        public Guid Id { get; set; }
        
        /// <summary>
        /// ID of the user who owns this task
        /// </summary>
        public Guid UserId { get; set; }
        
        /// <summary>
        /// ID of the context this task belongs to
        /// </summary>
        public Guid ContextId { get; set; }
        
        /// <summary>
        /// Title/name of the task
        /// </summary>
        public string Title { get; set; } = string.Empty;
        
        /// <summary>
        /// Detailed description of the task
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// Estimated time to complete in minutes
        /// </summary>
        public int EstimatedMinutes { get; set; }
        
        /// <summary>
        /// Priority level (Low, Medium, High)
        /// </summary>
        public Priority Priority { get; set; }
        
        /// <summary>
        /// Current status (Todo, InProgress, Completed)
        /// </summary>
        public TaskStatus Status { get; set; }
        
        /// <summary>
        /// Optional deadline for the task
        /// </summary>
        public DateTime? DueDate { get; set; }
        
        /// <summary>
        /// When the task was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// When the task was marked as completed (null if not completed)
        /// </summary>
        public DateTime? CompletedAt { get; set; }
        
        // Navigation properties for Entity Framework relationships
        public User User { get; set; } = null!;
        public Context Context { get; set; } = null!;
    }
    
    /// <summary>
    /// Priority levels for tasks
    /// </summary>
    public enum Priority
    {
        Low = 0,
        Medium = 1,
        High = 2
    }
    
    /// <summary>
    /// Status of a task in the workflow
    /// </summary>
    public enum TaskStatus
    {
        Todo = 0,
        InProgress = 1,
        Completed = 2
    }
}

