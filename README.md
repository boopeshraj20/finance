# Personal Finance Chatbot

A full-stack web application featuring an AI-powered personal finance assistant that helps users manage their finances through intelligent conversations and comprehensive financial tracking.

## Features

### 🤖 AI-Powered Chat Assistant
- Intelligent financial advice and recommendations
- Context-aware responses based on user's financial data
- Support for budgeting, expense tracking, saving strategies, and investment guidance

### 💰 Financial Management
- **Transaction Tracking**: Add and categorize income and expenses
- **Budget Management**: Create and monitor budgets by category and period
- **Financial Dashboard**: Visual overview of spending patterns and financial health
- **Data Visualization**: Interactive charts and graphs for better insights

### 🔐 User Authentication
- Secure user registration and login
- JWT-based authentication
- Protected routes and API endpoints

### 📊 Analytics & Insights
- Real-time financial summaries
- Spending pattern analysis
- Income vs. expense tracking
- Category-based expense breakdown

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Axios** for API communication
- **Recharts** for data visualization
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Project Structure

```
finance-chatbot/
├── server/                 # Backend API
│   ├── routes/            # API route handlers
│   │   ├── auth.js        # Authentication routes
│   │   ├── chat.js        # Chat functionality
│   │   └── finance.js     # Financial data management
│   ├── database/          # Database configuration
│   │   └── db.js          # SQLite setup and schema
│   ├── package.json       # Backend dependencies
│   └── index.js           # Express server setup
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React context providers
│   │   └── App.js         # Main application component
│   └── package.json       # Frontend dependencies
└── package.json           # Root package configuration
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-chatbot
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   DB_PATH=./database.sqlite
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Setup

If you prefer to set up the backend and frontend separately:

#### Backend Setup
```bash
cd server
npm install
npm run dev
```

#### Frontend Setup
```bash
cd client
npm install
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chat
- `POST /api/chat/session` - Create new chat session
- `POST /api/chat/message` - Send message to chatbot
- `GET /api/chat/history/:sessionId` - Get chat history

### Finance
- `POST /api/finance/transaction` - Add financial transaction
- `GET /api/finance/transactions` - Get user transactions
- `POST /api/finance/budget` - Create budget
- `GET /api/finance/budgets` - Get user budgets
- `GET /api/finance/summary` - Get financial summary
- `DELETE /api/finance/transaction/:id` - Delete transaction
- `DELETE /api/finance/budget/:id` - Delete budget

## Usage

### Getting Started
1. **Register/Login**: Create an account or sign in to access the application
2. **Dashboard**: View your financial overview and quick stats
3. **Add Transactions**: Track your income and expenses by category
4. **Create Budgets**: Set spending limits for different categories
5. **Chat with AI**: Get personalized financial advice and insights

### Chat Features
The AI assistant can help with:
- Budget planning and analysis
- Expense tracking and categorization
- Saving strategies and recommendations
- Investment guidance (basic)
- Debt management advice
- Financial goal setting

### Financial Tracking
- **Categories**: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, and more
- **Transaction Types**: Income and Expenses
- **Budget Periods**: Monthly, Weekly, or Yearly
- **Visual Analytics**: Pie charts and bar graphs for spending analysis

## Development

### Adding New Features
1. Backend: Add new routes in `server/routes/`
2. Frontend: Create new components in `client/src/components/`
3. Database: Modify schema in `server/database/db.js`

### Database Schema
The application uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `chat_sessions` - Chat conversation sessions
- `messages` - Individual chat messages
- `financial_data` - Income and expense transactions
- `budgets` - User-defined budget categories and limits

## Production Deployment

### Environment Variables
Set the following environment variables for production:
```bash
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret
DB_PATH=/path/to/production/database.sqlite
```

### Build for Production
```bash
# Build the React frontend
npm run build

# The built files will be in client/build/
# Serve them with your Express server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a demo application. For production use, consider implementing additional security measures, data validation, and error handling.