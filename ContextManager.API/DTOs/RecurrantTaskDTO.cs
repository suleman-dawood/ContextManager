using ContextManager.API.Models;

namespace ContextManager.API.DTOs
{
    public class CreateRecurrantTaskRequest
    {
        public Guid ContextId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public RecurrenceType RecurrenceType { get; set; }
        public List<string>? RecurrenceDays { get; set; }
        public DateTime RecurrenceStartDate { get; set; }
        public DateTime? RecurrenceEndDate { get; set; }
    }

    public class UpdateRecurrantTaskRequest
    {
        public Guid ContextId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public RecurrenceType RecurrenceType { get; set; }
        public List<string>? RecurrenceDays { get; set; }
        public DateTime RecurrenceStartDate { get; set; }
        public DateTime? RecurrenceEndDate { get; set; }
    }

    public class RecurrantTaskResponse
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid ContextId { get; set; }
        public string ContextName { get; set; } = string.Empty;
        public string ContextColor { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public RecurrenceType RecurrenceType { get; set; }
        public List<string>? RecurrenceDays { get; set; }
        public DateTime RecurrenceStartDate { get; set; }
        public DateTime? RecurrenceEndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public int InstanceCount { get; set; }
        public string RecurrencePattern { get; set; } = string.Empty;
    }

}