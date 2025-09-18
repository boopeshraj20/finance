import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    createNewSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = async () => {
    try {
      const response = await axios.post('/api/chat/session');
      setSessionId(response.data.sessionId);
      
      // Add welcome message
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: "Hello! I'm your personal finance assistant. I can help you with budgeting, expense tracking, saving strategies, investments, debt management, and financial planning. What would you like to know about your finances?",
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to start chat session');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat/message', {
        sessionId,
        message: inputMessage
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="container" style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#212529', marginBottom: '8px' }}>
          Finance Chat
        </h1>
        <p style={{ color: '#6c757d', fontSize: '18px' }}>
          Chat with your AI financial assistant
        </p>
      </div>

      <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          borderBottom: '1px solid #dee2e6'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                marginBottom: '16px',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                maxWidth: '70%',
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
              }}>
                <div style={{
                  background: message.role === 'user' ? '#667eea' : '#f8f9fa',
                  color: message.role === 'user' ? 'white' : '#212529',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div style={{
                  background: message.role === 'user' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#f8f9fa',
                  color: message.role === 'user' ? 'white' : '#212529',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  maxWidth: '100%',
                  wordWrap: 'break-word'
                }}>
                  <p style={{ margin: '0', lineHeight: '1.5' }}>
                    {message.content}
                  </p>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.7,
                    marginTop: '4px'
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                background: '#f8f9fa',
                color: '#212529',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={20} />
              </div>
              <div style={{
                background: '#f8f9fa',
                color: '#212529',
                padding: '12px 16px',
                borderRadius: '18px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#667eea',
                    animation: 'bounce 1.4s ease-in-out infinite both'
                  }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#667eea',
                    animation: 'bounce 1.4s ease-in-out infinite both',
                    animationDelay: '-0.16s'
                  }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#667eea',
                    animation: 'bounce 1.4s ease-in-out infinite both',
                    animationDelay: '-0.32s'
                  }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={{
          padding: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about your finances..."
            className="form-input"
            style={{ flex: 1, margin: 0 }}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !inputMessage.trim()}
            style={{ padding: '12px 20px' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;