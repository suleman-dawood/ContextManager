import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsApi } from '../services/api';
import type { ContextDistribution, CompletionRate } from '../types';

/**
 * Analytics page showing productivity insights
 */
export const Analytics = () => {
  const navigate = useNavigate();
  const [contextDistribution, setContextDistribution] = useState<ContextDistribution[]>([]);
  const [completionRate, setCompletionRate] = useState<CompletionRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [distribution, completion] = await Promise.all([
        analyticsApi.getContextDistribution(),
        analyticsApi.getCompletionRate()
      ]);
      setContextDistribution(distribution);
      setCompletionRate(completion);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <h1>Productivity Analytics</h1>
      </header>

      <div className="container">
        <div className="charts-grid">
          {/* Chart 1: Task Distribution by Context */}
          <div className="chart-card">
            <h2>Tasks by Context</h2>
            <p className="chart-description">Distribution of your tasks across different mental contexts</p>
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
                    {contextDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No task data available</div>
            )}
          </div>

          {/* Chart 2: Completion Rate Over Time */}
          <div className="chart-card">
            <h2>Completion Rate (Last 7 Days)</h2>
            <p className="chart-description">Your daily task completion percentage</p>
            {completionRate.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={completionRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number) => `${value}%`}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Completion Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No completion data available</div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="summary-section">
          <h2>Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-value">
                {contextDistribution.reduce((sum, c) => sum + c.count, 0)}
              </div>
              <div className="summary-label">Total Tasks</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {completionRate.length > 0 
                  ? Math.round(completionRate.reduce((sum, c) => sum + c.rate, 0) / completionRate.length)
                  : 0}%
              </div>
              <div className="summary-label">Avg. Completion Rate</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{contextDistribution.length}</div>
              <div className="summary-label">Active Contexts</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .analytics-page {
          min-height: 100vh;
          background: var(--gray-50);
        }

        .analytics-header {
          background: white;
          padding: 24px;
          border-bottom: 1px solid var(--gray-200);
        }

        .analytics-header h1 {
          font-size: 24px;
          margin: 16px 0 0 0;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-card h2 {
          font-size: 18px;
          margin: 0 0 8px 0;
        }

        .chart-description {
          color: var(--gray-600);
          font-size: 14px;
          margin: 0 0 24px 0;
        }

        .empty-chart {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-600);
        }

        .summary-section {
          margin-top: 32px;
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .summary-section h2 {
          font-size: 18px;
          margin: 0 0 20px 0;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .summary-card {
          text-align: center;
          padding: 20px;
          background: var(--gray-50);
          border-radius: 8px;
        }

        .summary-value {
          font-size: 36px;
          font-weight: 700;
          color: var(--primary);
        }

        .summary-label {
          font-size: 14px;
          color: var(--gray-600);
          margin-top: 8px;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 18px;
          color: var(--gray-600);
        }
      `}</style>
    </div>
  );
};

