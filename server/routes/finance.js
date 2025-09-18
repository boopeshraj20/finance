const express = require('express');
const db = require('../database/db');
const { verifyToken } = require('./auth');

const router = express.Router();

// Add financial transaction
router.post('/transaction', verifyToken, async (req, res) => {
  try {
    const { category, amount, description, date, type } = req.body;
    const userId = req.user.userId;

    if (!category || !amount || !date || !type) {
      return res.status(400).json({ error: 'Category, amount, date, and type are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be either "income" or "expense"' });
    }

    const transactionId = await new Promise((resolve, reject) => {
      db.run('INSERT INTO financial_data (user_id, category, amount, description, date, type) VALUES (?, ?, ?, ?, ?, ?)', 
        [userId, category, amount, description, date, type], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
    });

    res.status(201).json({ 
      message: 'Transaction added successfully', 
      transactionId 
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Get financial transactions
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0, type, category } = req.query;

    let query = 'SELECT * FROM financial_data WHERE user_id = ?';
    const params = [userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const transactions = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Transaction retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

// Add budget
router.post('/budget', verifyToken, async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    const userId = req.user.userId;

    if (!category || !amount || !period) {
      return res.status(400).json({ error: 'Category, amount, and period are required' });
    }

    if (!['monthly', 'weekly', 'yearly'].includes(period)) {
      return res.status(400).json({ error: 'Period must be monthly, weekly, or yearly' });
    }

    const budgetId = await new Promise((resolve, reject) => {
      db.run('INSERT INTO budgets (user_id, category, amount, period) VALUES (?, ?, ?, ?)', 
        [userId, category, amount, period], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
    });

    res.status(201).json({ 
      message: 'Budget created successfully', 
      budgetId 
    });
  } catch (error) {
    console.error('Budget creation error:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Get budgets
router.get('/budgets', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const budgets = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC', 
        [userId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
    });

    res.json({ budgets });
  } catch (error) {
    console.error('Budget retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve budgets' });
  }
});

// Get financial summary
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = '30' } = req.query; // days

    const query = `
      SELECT 
        type,
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM financial_data 
      WHERE user_id = ? 
        AND date >= date('now', '-${parseInt(period)} days')
      GROUP BY type, category
      ORDER BY type, total DESC
    `;

    const summary = await new Promise((resolve, reject) => {
      db.all(query, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Calculate totals
    const income = summary.filter(item => item.type === 'income');
    const expenses = summary.filter(item => item.type === 'expense');
    
    const totalIncome = income.reduce((sum, item) => sum + item.total, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.total, 0);
    const netIncome = totalIncome - totalExpenses;

    res.json({
      period: `${period} days`,
      totalIncome,
      totalExpenses,
      netIncome,
      breakdown: summary
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Delete transaction
router.delete('/transaction/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM financial_data WHERE id = ? AND user_id = ?', 
        [id, userId], function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
    });

    if (result === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Transaction deletion error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Delete budget
router.delete('/budget/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await new Promise((resolve, reject) => {
      db.run('DELETE FROM budgets WHERE id = ? AND user_id = ?', 
        [id, userId], function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
    });

    if (result === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Budget deletion error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router;