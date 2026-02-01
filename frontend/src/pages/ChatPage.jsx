import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, User } from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header'; // Add this import

const ChatPage = () => {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://https://synapso-app.onrender.com/messages/chat/${matchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessages(response.data);
      
      if (response.data.length > 0) {
        const otherMsg = response.data.find(msg => msg.sender_id !== user.id);
        if (otherMsg) {
          setOtherUser({ 
            id: otherMsg.sender_id, 
            username: otherMsg.sender_username 
          });
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 403) {
        navigate('/matches');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post('http://https://synapso-app.onrender.com/messages/send', {
        match_id: matchId,
        content: newMessage.trim()
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 80px)',
          background: 'linear-gradient(135deg, #d9c096 0%, #b59175 30%, #886355 70%, #3d302d 100%)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '30px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#3d302d',
            fontWeight: '600',
            fontSize: '1.1rem'
          }}>
            Loading chat...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{
        height: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #d9c096 0%, #b59175 30%, #886355 70%, #3d302d 100%)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderLeft: 'none',
          borderRight: 'none',
          borderTop: 'none'
        }}>
          <button
            onClick={() => navigate('/chats')}
            style={{
              background: 'rgba(217, 192, 150, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(217, 192, 150, 0.4)',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3d302d',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(217, 192, 150, 0.45)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(217, 192, 150, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #b59175, #886355)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            boxShadow: '0 4px 15px rgba(136, 99, 85, 0.3)'
          }}>
            {otherUser ? otherUser.username.charAt(0).toUpperCase() : '?'}
          </div>
          
          <div>
            <h2 style={{ 
              margin: 0, 
              color: '#3d302d',
              fontSize: '1.2rem',
              fontWeight: '700'
            }}>
              {otherUser ? otherUser.username : 'Study Partner'}
            </h2>
            <p style={{ 
              margin: 0, 
              color: 'rgba(61, 48, 45, 0.7)', 
              fontSize: '0.85rem',
              fontWeight: '500'
            }}>
              {messages.length === 0 ? 'Start the conversation!' : 'Active now'}
            </p>
          </div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              padding: '40px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              maxWidth: '400px',
              margin: '80px auto 0'
            }}>
              <User size={56} style={{ 
                marginBottom: '24px', 
                color: '#3d302d',
                opacity: 0.6
              }} />
              <h3 style={{ 
                color: '#3d302d',
                fontSize: '1.5rem',
                marginBottom: '12px',
                fontWeight: '700'
              }}>
                You matched! 🎉
              </h3>
              <p style={{ 
                color: 'rgba(61, 48, 45, 0.7)',
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                Start a conversation with your study partner
              </p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isMe = message.sender_id === user.id;
              const showDate = index === 0 || 
                formatDate(messages[index - 1].sent_at) !== formatDate(message.sent_at);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '24px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        display: 'inline-block',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        color: 'rgba(61, 48, 45, 0.8)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        {formatDate(message.sent_at)}
                      </div>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '14px 18px',
                      borderRadius: '18px',
                      background: isMe 
                        ? 'linear-gradient(135deg, #b59175, #886355)'
                        : 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                      border: `1px solid ${isMe ? 'rgba(136, 99, 85, 0.3)' : 'rgba(255, 255, 255, 0.25)'}`,
                      color: isMe ? 'white' : '#3d302d',
                      wordWrap: 'break-word',
                      boxShadow: isMe 
                        ? '0 4px 15px rgba(136, 99, 85, 0.25)' 
                        : '0 4px 15px rgba(0, 0, 0, 0.05)'
                    }}>
                      <div style={{ 
                        marginBottom: '6px',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        lineHeight: '1.5'
                      }}>
                        {message.content}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        opacity: 0.7,
                        textAlign: 'right',
                        fontWeight: '500'
                      }}>
                        {formatTime(message.sent_at)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '20px 24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '14px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '20px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.3s ease',
              color: '#3d302d',
              fontWeight: '500'
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.borderColor = 'rgba(217, 192, 150, 0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(217, 192, 150, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: 'none',
              background: newMessage.trim() && !sending 
                ? 'linear-gradient(135deg, #b59175, #886355)'
                : 'rgba(181, 145, 117, 0.3)',
              color: newMessage.trim() && !sending ? 'white' : 'rgba(61, 48, 45, 0.4)',
              cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: newMessage.trim() && !sending 
                ? '0 4px 15px rgba(136, 99, 85, 0.3)' 
                : 'none'
            }}
            onMouseOver={(e) => {
              if (newMessage.trim() && !sending) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 20px rgba(136, 99, 85, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = newMessage.trim() && !sending 
                ? '0 4px 15px rgba(136, 99, 85, 0.3)' 
                : 'none';
            }}
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
