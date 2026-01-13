using System;

namespace ContextManager.API.Models
{
    public class Task
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid ContextId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public TaskStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public User User { get; set; } = null!;
        public Context Context { get; set; } = null!;
    }
    
    public enum Priority
    {
        Low = 0,
        Medium = 1,
        High = 2
    }

    public enum TaskStatus
    {
        Todo = 0,
        InProgress = 1,
        Completed = 2
    }
}

