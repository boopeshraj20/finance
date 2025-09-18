import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const [transactionForm, setTransactionForm] = useState({
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'expense'
  });

  const [budgetForm, setBudgetForm] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/finance/transactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/api/finance/budgets');
      setBudgets(response.data.budgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to fetch budgets');
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/finance/transaction', transactionForm);
      toast.success('Transaction added successfully');
      setShowTransactionForm(false);
      setTransactionForm({
        category: '',
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'expense'
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/finance/budget', budgetForm);
      toast.success('Budget created successfully');
      setShowBudgetForm(false);
      setBudgetForm({
        category: '',
        amount: '',
        period: 'monthly'
      });
      fetchBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await axios.delete(`/api/finance/transaction/${id}`);
      toast.success('Transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const deleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await axios.delete(`/api/finance/budget/${id}`);
      toast.success('Budget deleted successfully');
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
    'Groceries', 'Gas', 'Rent', 'Insurance', 'Other'
  ];

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#212529', marginBottom: '8px' }}>
          Financial Management
        </h1>
        <p style={{ color: '#6c757d', fontSize: '18px' }}>
          Track your transactions and manage your budgets
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid #dee2e6'
      }}>
        <button
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('transactions')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          <DollarSign size={18} />
          Transactions
        </button>
        <button
          className={`btn ${activeTab === 'budgets' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('budgets')}
          style={{ borderRadius: '8px 8px 0 0' }}
        >
          <TrendingUp size={18} />
          Budgets
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Transactions</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowTransactionForm(true)}
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </div>

          {/* Transaction Form Modal */}
          {showTransactionForm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Add Transaction</h3>
                <form onSubmit={handleTransactionSubmit}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      value={transactionForm.type}
                      onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={transactionForm.category}
                      onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                      className="form-input"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      value={transactionForm.description}
                      onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                      className="form-input"
                      placeholder="Optional description"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      value={transactionForm.date}
                      onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowTransactionForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Transaction'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="card">
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                No transactions found. Add your first transaction to get started.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                        <td style={{ padding: '12px' }}>
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: '#f8f9fa',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {transaction.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{transaction.description || '-'}</td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'right',
                          color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                          fontWeight: '600'
                        }}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            className="btn btn-danger"
                            onClick={() => deleteTransaction(transaction.id)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Budgets</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowBudgetForm(true)}
            >
              <Plus size={18} />
              Add Budget
            </button>
          </div>

          {/* Budget Form Modal */}
          {showBudgetForm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Create Budget</h3>
                <form onSubmit={handleBudgetSubmit}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={budgetForm.category}
                      onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={budgetForm.amount}
                      onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
                      className="form-input"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Period</label>
                    <select
                      value={budgetForm.period}
                      onChange={(e) => setBudgetForm({...budgetForm, period: e.target.value})}
                      className="form-select"
                      required
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowBudgetForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Budget'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Budgets List */}
          <div className="card">
            {budgets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                No budgets found. Create your first budget to start tracking your spending.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Period</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((budget) => (
                      <tr key={budget.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: '#f8f9fa',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {budget.category}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'right',
                          fontWeight: '600'
                        }}>
                          ${budget.amount}
                        </td>
                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                          {budget.period}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            className="btn btn-danger"
                            onClick={() => deleteBudget(budget.id)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;