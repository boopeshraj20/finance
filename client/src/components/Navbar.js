import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, BarChart3, DollarSign, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/finance', label: 'Finance', icon: DollarSign }
  ];

  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '0 20px',
      marginBottom: '20px'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link 
            to="/dashboard" 
            style={{ 
              textDecoration: 'none', 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#667eea'
            }}
          >
            FinanceBot
          </Link>
          
          <div style={{ display: 'flex', gap: '24px' }}>
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                style={{
                  textDecoration: 'none',
                  color: location.pathname === path ? '#667eea' : '#6c757d',
                  fontWeight: location.pathname === path ? '600' : '400',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} />
            <span style={{ color: '#495057' }}>{user?.username}</span>
          </div>
          
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;