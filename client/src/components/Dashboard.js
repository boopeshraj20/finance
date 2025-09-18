import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, DollarSign, TrendingUp, TrendingDown, Plus, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/api/finance/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  const pieData = summary?.breakdown?.filter(item => item.type === 'expense').map((item, index) => ({
    name: item.category,
    value: item.total,
    color: COLORS[index % COLORS.length]
  })) || [];

  const barData = summary?.breakdown?.filter(item => item.type === 'expense').map(item => ({
    category: item.category,
    amount: item.total
  })) || [];

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className="text-center">
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#212529', marginBottom: '8px' }}>
          Financial Dashboard
        </h1>
        <p style={{ color: '#6c757d', fontSize: '18px' }}>
          Overview of your financial health and spending patterns
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '12px',
              color: 'white'
            }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#212529' }}>
                ${summary?.totalIncome?.toFixed(2) || '0.00'}
              </h3>
              <p style={{ margin: '0', color: '#6c757d' }}>Total Income</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              padding: '12px',
              color: 'white'
            }}>
              <TrendingDown size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#212529' }}>
                ${summary?.totalExpenses?.toFixed(2) || '0.00'}
              </h3>
              <p style={{ margin: '0', color: '#6c757d' }}>Total Expenses</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: summary?.netIncome >= 0 
                ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                : 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
              borderRadius: '12px',
              padding: '12px',
              color: 'white'
            }}>
              <DollarSign size={24} />
            </div>
            <div>
              <h3 style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#212529' }}>
                ${summary?.netIncome?.toFixed(2) || '0.00'}
              </h3>
              <p style={{ margin: '0', color: '#6c757d' }}>Net Income</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Pie Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Expense Categories</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              No expense data available
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Spending by Category</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              No spending data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px'
        }}>
          <Link to="/chat" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <MessageCircle size={18} />
            Chat with AI
          </Link>
          <Link to="/finance" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <Plus size={18} />
            Add Transaction
          </Link>
          <Link to="/finance" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            <BarChart3 size={18} />
            Manage Budgets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;