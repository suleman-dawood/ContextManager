using ContextManager.API.Models;

namespace ContextManager.API.DTOs
{
    public class CreateTaskRequest
    {
        public Guid ContextId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UpdateTaskRequest
    {
        public Guid ContextId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public Models.TaskStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
    }

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

