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
}
