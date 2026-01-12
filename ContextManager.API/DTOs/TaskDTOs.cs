using ContextManager.API.Models;

namespace ContextManager.API.DTOs
{
    /// <summary>
    /// Request data for creating a new task
    /// </summary>
    public class CreateTaskRequest
    {
        public Guid ContextId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public DateTime? DueDate { get; set; }
    }

    /// <summary>
    /// Request data for updating an existing task
    /// </summary>
    public class UpdateTaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public Models.TaskStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
    }

    /// <summary>
    /// Response data for a task (includes context details)
    /// </summary>
    public class TaskResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid ContextId { get; set; }
        public string ContextName { get; set; } = string.Empty;
        public string ContextColor { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public Models.TaskStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}

