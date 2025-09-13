import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const Mitra = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageIdCounter, setMessageIdCounter] = useState(1);

  // Get API key from environment
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCzOBeYUKB6MsPt3bKkUZ0vS8_4LDYmf4Y";

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 0,
      text: "Hello! I'm Kisan Mitra, your digital assistant for farming. How can I help you today?",
      isUser: false
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messageIdCounter,
      text: inputMessage,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessageIdCounter(prev => prev + 1);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
    const systemPrompt = "You are Hariyali Mitra, an expert AI farming assistant for Indian farmers using the KisanMitra agricultural support app. You help farmers with: crop cultivation, plant disease, soil health, weather, pest control, market prices, and agricultural best practices for Indian conditions. Speak in simple, everyday language and be supportive. Provide actionable, practical advice relevant to Indian farming.";

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: currentMessage }]
          }],
          tools: [{ "google_search": {} }],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      const botResponse = result.candidates[0].content.parts[0].text;
      
      // Add bot response
      const botMessage: Message = {
        id: messageIdCounter + 1,
        text: botResponse,
        isUser: false
      };
      
      setMessages(prev => [...prev, botMessage]);
      setMessageIdCounter(prev => prev + 2);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: messageIdCounter + 1,
        text: "I am having trouble connecting to the network. Please check your internet connection.",
        isUser: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setMessageIdCounter(prev => prev + 2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-green-600 text-white p-4 flex items-center justify-between rounded-t-2xl shadow-md">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Kisan Mitra</h1>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-3.25 9a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`${
                message.isUser 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              } p-3 rounded-xl max-w-[80%] shadow-sm`}>
                {message.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 p-3 rounded-xl shadow-sm animate-pulse">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input and Send Button */}
        <div className="p-4 border-t border-gray-200 flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Type your message here..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyUp={handleKeyPress}
            disabled={isLoading}
            className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
          />
          <button 
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
          >
            <Send className="w-6 h-6 rotate-90" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Mitra;