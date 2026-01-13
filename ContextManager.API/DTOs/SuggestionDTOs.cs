namespace ContextManager.API.DTOs
{
    /// <summary>
    /// Request data for AI-powered context categorization
    /// </summary>
    public class CategorizeTaskRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response data for context categorization
    /// </summary>
    public class ContextCategorizationResponse
    {
        public Guid ContextId { get; set; }
        public string ContextName { get; set; } = string.Empty;
        public float Confidence { get; set; }
        public string Reasoning { get; set; } = string.Empty;
    }
}
