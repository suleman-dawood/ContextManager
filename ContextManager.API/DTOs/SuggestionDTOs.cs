namespace ContextManager.API.DTOs
{
    /// <summary>
    /// Response data for an AI-generated task suggestion
    /// </summary>
    public class TaskSuggestionResponse
    {
        public Guid Id { get; set; }
        public Guid TaskId { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public string TaskDescription { get; set; } = string.Empty;
        public int EstimatedMinutes { get; set; }
        public float Confidence { get; set; }
        public string Reasoning { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Request data for providing feedback on a suggestion
    /// </summary>
    public class SuggestionFeedbackRequest
    {
        public bool Accepted { get; set; }
    }
}

