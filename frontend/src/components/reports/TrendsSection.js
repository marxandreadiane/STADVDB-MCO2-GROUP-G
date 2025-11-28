import React, { useState, useEffect } from 'react';
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

const Tabs = ({ activeTab, onChange }) => (
  <div className="trend-tabs">
    {['daily', 'monthly', 'quarterly', 'annual'].map(tab => (
      <button
        key={tab}
        className={`trend-tab ${activeTab === tab ? 'active' : ''}`}
        onClick={() => onChange(tab)}
      >
        {tab === 'daily'
          ? 'Daily'
          : tab === 'monthly'
          ? 'Monthly'
          : tab === 'quarterly'
          ? 'Quarterly'
          : 'Annual'}
      </button>
    ))}
  </div>
);

const LineChart = ({ data, isAdmin, formatCurrency }) => (
  <div className="line-chart-wrapper">
    <ResponsiveContainer width="100%" height={280}>
      <ReLineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis yAxisId="left" />
        {isAdmin && <YAxis yAxisId="right" orientation="right" />}
        <Tooltip
          formatter={(value, name) => (name === 'Revenue' ? formatCurrency(value) : value)}
          labelFormatter={(label, payload) => {
            const point = payload?.[0]?.payload;
            const quarterInfo = point?.type === 'month' ? point?.quarter : point?.period;
            return point?.type === 'month' ? `${label} (${quarterInfo})` : label;
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="orders" stroke="#ffa502" strokeWidth={3} dot={{ r: 5 }} name="Orders" yAxisId="left" />
        {isAdmin && (
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#20bf6b"
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Revenue"
            yAxisId="right"
          />
        )}
      </ReLineChart>
    </ResponsiveContainer>
  </div>
);

const TrendsSection = ({
  dailyData,
  monthlyData,
  quarterlyData,
  annualData,
  isAdmin,
  getBarWidth,
  formatCurrency,
  formatDate
}) => {
  const [activeTab, setActiveTab] = useState('daily');
  const [visibleCount, setVisibleCount] = useState(10);

  const hasDailyOverflow = dailyData.length > 10;
  const visibleDaily = hasDailyOverflow ? dailyData.slice(0, visibleCount) : dailyData;
  const dailyMaxRevenue = Math.max(...dailyData.map(item => parseFloat(item.revenue || 0)), 1);
  const dailyMaxOrders = Math.max(...dailyData.map(item => parseFloat(item.orders || 0)), 1);

  useEffect(() => {
    setVisibleCount(Math.min(10, dailyData.length));
  }, [dailyData]);

  return (
    <div className="report-section">
      <div className="section-header">
        <h2>{isAdmin ? 'TIME SERIES: Sales Trends' : 'Activity Trends'}</h2>
        <p>Analyze performance across daily, quarterly, and annual views</p>
      </div>

      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'daily' && (
        <>
          <div className="trend-chart">
            {visibleDaily.map((trend, idx) => (
              <div key={idx} className="trend-item">
                <div className="trend-date">{formatDate(trend.date)}</div>
                <div className="trend-bars">
                  {isAdmin && (
                    <div className="trend-bar-group">
                      <div className="trend-bar-label">Revenue</div>
                      <div className="trend-bar-track">
                        <div className="trend-bar-fill green-bar" style={{ width: getBarWidth(trend.revenue, dailyMaxRevenue) }}></div>
                      </div>
                      <div className="trend-value">{formatCurrency(trend.revenue)}</div>
                    </div>
                  )}
                  <div className="trend-bar-group">
                    <div className="trend-bar-label">Orders</div>
                    <div className="trend-bar-track">
                      <div className="trend-bar-fill orange-bar" style={{ width: getBarWidth(trend.orders, dailyMaxOrders) }}></div>
                    </div>
                    <div className="trend-value">{trend.orders} orders</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {hasDailyOverflow && (
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={() => setVisibleCount(prev => Math.max(10, prev - 10))}
                disabled={visibleCount <= 10}
              >
                &lt;
              </button>
              <span className="pagination-info">{`1-${visibleCount} of ${dailyData.length}`}</span>
              <button
                className="pagination-button"
                onClick={() => setVisibleCount(prev => Math.min(dailyData.length, prev + 10))}
                disabled={visibleCount >= dailyData.length}
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'monthly' && (
        <LineChart data={monthlyData} isAdmin={isAdmin} formatCurrency={formatCurrency} />
      )}

      {activeTab === 'quarterly' && (
        <LineChart data={quarterlyData} isAdmin={isAdmin} formatCurrency={formatCurrency} />
      )}

      {activeTab === 'annual' && (
        <LineChart data={annualData} isAdmin={isAdmin} formatCurrency={formatCurrency} />
      )}
    </div>
  );
};

export default TrendsSection;

