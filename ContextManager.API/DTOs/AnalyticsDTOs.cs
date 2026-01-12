namespace ContextManager.API.DTOs
{
    /// <summary>
    /// Response data for context distribution analytics
    /// Shows how many tasks are in each context
    /// </summary>
    public class ContextDistributionResponse
    {
        public string Context { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    /// <summary>
    /// Response data for completion rate over time
    /// Shows daily completion rates for the last 7 days
    /// </summary>
    public class CompletionRateResponse
    {
        public string Date { get; set; } = string.Empty;
        public double Rate { get; set; }
        public int Completed { get; set; }
        public int Total { get; set; }
    }
}

