using ContextManager.API.Models;

namespace ContextManager.API.DTOs
{
    public class CategorizeTaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class ContextCategorizationResponse
    {
        public Guid ContextId { get; set; }
        public string ContextName { get; set; } = string.Empty;
        public float Confidence { get; set; }
        public string Reasoning { get; set; } = string.Empty;
    }

    public class TaskFromNaturalLanguageRequest
    {
        public string NaturalLanguage { get; set; } = string.Empty;
    }

    public class TaskFromNaturalLanguageResponse
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public Priority Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public Guid ContextId { get; set; }
    }
}
