import React, { useState, useEffect, useRef } from 'react';
import locationService from '../services/locationService';
import './ChatBot.css';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const API_ENDPOINT = 'https://3vu1g7u9qc.execute-api.ap-south-1.amazonaws.com/prod/chat';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      // Add welcome message
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I can help you find out where Krishnaji is or will be. You can ask me questions like:\n\n• "Where is Krishnaji today?"\n• "Where will Krishnaji be on December 25?"\n• "Is Krishnaji in Mumbai this week?"\n• "What are Krishnaji\'s upcoming trips?"',
          timestamp: new Date()
        }
      ]);
    }
  }, [isChatOpen]);

  const getLocationContext = async () => {
    try {
      const locations = await locationService.getAllLocations();

      // Format locations for context
      const today = new Date();
      const locationContext = locations.map(loc => {
        const fromDate = new Date(loc.fromDate || loc.date);
        const toDate = loc.toDate ? new Date(loc.toDate) : fromDate;

        return {
          name: loc.name,
          country: loc.country,
          type: loc.type,
          fromDate: loc.fromDate || loc.date,
          toDate: loc.toDate || loc.fromDate || loc.date,
          notes: loc.notes,
          coordinates: loc.coordinates
        };
      }).sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate));

      // Create context text
      const currentLocation = locationContext.find(loc => {
        const from = new Date(loc.fromDate);
        const to = new Date(loc.toDate);
        return today >= from && today <= to && loc.type === 'actual';
      });

      const upcomingTrips = locationContext.filter(loc => {
        const from = new Date(loc.fromDate);
        return from > today;
      }).slice(0, 5);

      const recentTrips = locationContext.filter(loc => {
        const to = new Date(loc.toDate);
        return to < today && loc.type === 'actual';
      }).sort((a, b) => new Date(b.toDate) - new Date(a.toDate)).slice(0, 3);

      let context = `Current date: ${today.toISOString().split('T')[0]}\n\n`;

      if (currentLocation) {
        context += `CURRENT LOCATION:\nKrishnaji is currently in ${currentLocation.name}${currentLocation.country ? ', ' + currentLocation.country : ''} from ${currentLocation.fromDate} to ${currentLocation.toDate}.`;
        if (currentLocation.notes) {
          context += ` Notes: ${currentLocation.notes}`;
        }
        context += '\n\n';
      }

      if (upcomingTrips.length > 0) {
        context += 'UPCOMING TRIPS:\n';
        upcomingTrips.forEach(loc => {
          context += `- ${loc.name}${loc.country ? ', ' + loc.country : ''}: ${loc.fromDate} to ${loc.toDate} (${loc.type})`;
          if (loc.notes) context += ` - ${loc.notes}`;
          context += '\n';
        });
        context += '\n';
      }

      if (recentTrips.length > 0) {
        context += 'RECENT TRIPS:\n';
        recentTrips.forEach(loc => {
          context += `- ${loc.name}${loc.country ? ', ' + loc.country : ''}: ${loc.fromDate} to ${loc.toDate}`;
          if (loc.notes) context += ` - ${loc.notes}`;
          context += '\n';
        });
      }

      return context;
    } catch (error) {
      console.error('Error getting location context:', error);
      return 'No location data available.';
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get location context
      const locationContext = await getLocationContext();

      // Prepare the prompt with context
      const systemPrompt = `You are a helpful assistant that answers questions about Krishnaji's travel schedule and location.

Here is Krishnaji's travel information:

${locationContext}

Please answer the user's question based on this information. Be conversational and helpful. If the user asks about a specific date, check if Krishnaji will be at any location during that time. If asking about current location, refer to the CURRENT LOCATION section. Always mention both planned and actual trips when relevant.`;

      // Call Bedrock API
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
          context: systemPrompt
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.response || data.message || 'I apologize, but I could not process your request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling chatbot API:', error);

      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. How can I help you find Krishnaji?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={`chat-toggle-btn ${isChatOpen ? 'open' : ''}`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-label="Toggle chat"
      >
        {isChatOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Ask about Krishnaji</h3>
            <button onClick={clearChat} className="clear-btn" title="Clear chat">
              🗑️
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}
              >
                <div className="message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message assistant loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Krishnaji's location..."
              disabled={isLoading}
              rows="2"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="send-btn"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>

          <div className="chatbot-footer">
            <small>Powered by AWS Bedrock & Claude</small>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;
