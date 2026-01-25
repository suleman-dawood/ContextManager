using System;

namespace ContextManager.API.Models
{
    public class RecurrantTask
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid ContextId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public RecurrenceType RecurrenceType { get; set; }
        public string RecurrenceDays { get; set; } = string.Empty;
        public DateTime RecurrenceStartDate { get; set; }
        public DateTime? RecurrenceEndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public User User { get; set; } = null!;
        public Context Context { get; set; } = null!;
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
    }

    public enum RecurrenceType
    {
        Daily,
        Weekly,
        Biweekly,
        Monthly,
        Custom
    }
}