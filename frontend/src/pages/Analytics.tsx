import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import { AppHeader } from '../components/AppHeader';
import { Loading } from '../components/Loading';
import '../styles/Analytics.css';

export function Analytics() {
  const { contextDistribution, completionRate, loading, showActiveOnly, setShowActiveOnly } = useAnalytics();

  if (loading) {
    return <Loading fullPage message="Loading analytics..." />;
  }

  const totalTasks = contextDistribution.reduce((sum, c) => sum + c.count, 0);
  const avgCompletionRate = completionRate.length > 0
    ? Math.round(completionRate.reduce((sum, c) => sum + c.rate, 0) / completionRate.length)
    : 0;

  const pieChartCells = contextDistribution.map((entry) => (
    <Cell key={entry.context} fill={entry.color} />
  ));

  return (
    <div className="analytics-page page-wrapper">
      <AppHeader />

      <div className="container">
        <h1 className="analytics-title">Productivity Analytics</h1>
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header flex-between">
              <div>
                <h2>Tasks by Context</h2>
                <p className="chart-description">Distribution of your tasks across different contexts</p>
              </div>
              <div className="chart-actions">
                <button 
                  className="btn btn-secondary chart-toggle-btn"
                  onClick={() => setShowActiveOnly(!showActiveOnly)}
                >
                  {showActiveOnly ? 'All Tasks' : 'Active Only'}
                </button>
              </div>
            </div>
            {contextDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contextDistribution}
                    dataKey="count"
                    nameKey="context"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ context, count }) => `${context}: ${count}`}
                  >
                    {pieChartCells}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart text-muted">No task data available</div>
            )}
          </div>
        </div>

        <div className="summary-section">
          <h2 className="divider-bottom">Summary</h2>
          <div className="summary-grid grid-auto-fit">
            <div className="summary-card">
              <div className="summary-value">{totalTasks}</div>
              <div className="summary-label">Total Tasks</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{avgCompletionRate}%</div>
              <div className="summary-label">Average Completion Rate</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{contextDistribution.length}</div>
              <div className="summary-label">Active Contexts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
