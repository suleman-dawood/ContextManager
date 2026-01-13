namespace ContextManager.API.DTOs
{
    public class ContextDistributionResponse
    {
        public string Context { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class CompletionRateResponse
    {
        public string Date { get; set; } = string.Empty;
        public double Rate { get; set; }
        public int Completed { get; set; }
        public int Total { get; set; }
    }
}

