const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { verifyToken } = require('./auth');

const router = express.Router();

// Create new chat session
router.post('/session', verifyToken, async (req, res) => {
  try {
    const sessionId = uuidv4();
    const userId = req.user.userId;

    await new Promise((resolve, reject) => {
      db.run('INSERT INTO chat_sessions (user_id, session_id) VALUES (?, ?)', 
        [userId, sessionId], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
    });

    res.json({ sessionId, message: 'Chat session created' });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Send message and get response
router.post('/message', verifyToken, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user.userId;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }

    // Verify session belongs to user
    const session = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM chat_sessions WHERE session_id = ? AND user_id = ?', 
        [sessionId, userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Save user message
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', 
        [sessionId, 'user', message], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
    });

    // Generate AI response
    const response = await generateFinanceResponse(message, userId);

    // Save AI response
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)', 
        [sessionId, 'assistant', response], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
    });

    res.json({ response });
  } catch (error) {
    console.error('Message processing error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get chat history
router.get('/history/:sessionId', verifyToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    // Verify session belongs to user
    const session = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM chat_sessions WHERE session_id = ? AND user_id = ?', 
        [sessionId, userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get messages
    const messages = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC', 
        [sessionId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
    });

    res.json({ messages });
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Generate finance-specific response
async function generateFinanceResponse(message, userId) {
  const lowerMessage = message.toLowerCase();
  
  // Get user's financial data for context
  const financialData = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM financial_data WHERE user_id = ? ORDER BY date DESC LIMIT 10', 
      [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
  });

  const budgets = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM budgets WHERE user_id = ?', [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Finance-specific responses
  if (lowerMessage.includes('budget') || lowerMessage.includes('spending')) {
    return generateBudgetResponse(financialData, budgets);
  } else if (lowerMessage.includes('expense') || lowerMessage.includes('spend')) {
    return generateExpenseResponse(financialData);
  } else if (lowerMessage.includes('income') || lowerMessage.includes('earn')) {
    return generateIncomeResponse(financialData);
  } else if (lowerMessage.includes('saving') || lowerMessage.includes('save')) {
    return generateSavingResponse(financialData, budgets);
  } else if (lowerMessage.includes('investment') || lowerMessage.includes('invest')) {
    return generateInvestmentResponse();
  } else if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
    return generateDebtResponse();
  } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your personal finance assistant. I can help you with budgeting, tracking expenses, saving strategies, and financial planning. What would you like to know about your finances?";
  } else {
    return "I'm here to help with your personal finance questions! I can assist with budgeting, expense tracking, saving strategies, investments, debt management, and financial planning. What specific area would you like to discuss?";
  }
}

function generateBudgetResponse(financialData, budgets) {
  if (budgets.length === 0) {
    return "I notice you don't have any budgets set up yet. Would you like me to help you create a budget? I can analyze your spending patterns and suggest appropriate budget categories and amounts.";
  }

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const recentExpenses = financialData.filter(transaction => transaction.type === 'expense');
  const totalSpent = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return `Based on your current budget of $${totalBudget.toFixed(2)}, you've spent $${totalSpent.toFixed(2)} recently. ${totalSpent > totalBudget ? 'You might want to review your spending as you're over budget.' : 'Great job staying within your budget!'} Would you like me to help you adjust your budget or analyze your spending patterns?`;
}

function generateExpenseResponse(financialData) {
  const expenses = financialData.filter(transaction => transaction.type === 'expense');
  
  if (expenses.length === 0) {
    return "I don't see any expense records yet. Would you like to start tracking your expenses? I can help you categorize them and identify areas where you might be overspending.";
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categories = {};
  expenses.forEach(expense => {
    categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
  });

  const topCategory = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b);

  return `Your total expenses are $${totalExpenses.toFixed(2)}. Your highest spending category is ${topCategory} at $${categories[topCategory].toFixed(2)}. Would you like me to help you reduce spending in any particular category or set up expense tracking?`;
}

function generateIncomeResponse(financialData) {
  const income = financialData.filter(transaction => transaction.type === 'income');
  
  if (income.length === 0) {
    return "I don't see any income records yet. Would you like to start tracking your income sources? This will help me provide better financial advice and budgeting recommendations.";
  }

  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  return `Your total recorded income is $${totalIncome.toFixed(2)}. Would you like me to help you create a budget based on this income or analyze your income patterns?`;
}

function generateSavingResponse(financialData, budgets) {
  const income = financialData.filter(transaction => transaction.type === 'income');
  const expenses = financialData.filter(transaction => transaction.type === 'expense');
  
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const savings = totalIncome - totalExpenses;

  if (savings > 0) {
    return `Great! You're saving $${savings.toFixed(2)}. That's a ${((savings/totalIncome) * 100).toFixed(1)}% savings rate. Would you like me to help you set up an emergency fund or investment strategy?`;
  } else {
    return `I notice you're spending more than you're earning. Let's work on reducing expenses or increasing income. Would you like me to help you create a plan to get back on track?`;
  }
}

function generateInvestmentResponse() {
  return "I can help you with basic investment guidance! For beginners, I recommend starting with low-cost index funds, building an emergency fund first, and understanding your risk tolerance. Would you like me to explain different investment options or help you set investment goals?";
}

function generateDebtResponse() {
  return "Debt management is crucial for financial health. I can help you create a debt payoff strategy, prioritize high-interest debts, and develop a plan to become debt-free. What type of debt are you dealing with, and what's your current situation?";
}

module.exports = router;