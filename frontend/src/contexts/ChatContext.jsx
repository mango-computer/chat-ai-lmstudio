import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (data.length > 0 && !currentConversationId) {
        setCurrentConversationId(data[0].id);
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setIsLoading(true);
      const data = await api.getMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async () => {
    try {
      const newConversation = await api.createConversation();
      setConversations([newConversation, ...conversations]);
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      return newConversation.id;
    } catch (err) {
      setError('Failed to create conversation');
      console.error(err);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await api.deleteConversation(conversationId);
      const updated = conversations.filter(c => c.id !== conversationId);
      setConversations(updated);
      
      if (currentConversationId === conversationId) {
        if (updated.length > 0) {
          setCurrentConversationId(updated[0].id);
        } else {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      setError('Failed to delete conversation');
      console.error(err);
    }
  };

  const sendMessage = async (content) => {
    if (!currentConversationId || !content.trim() || isStreaming) return;

    // Add user message to UI
    const userMessage = {
      role: 'user',
      content: content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setStreamingMessage('');
    setIsStreaming(true);
    setError(null);

    // Track the full message as it streams
    let fullMessage = '';

    // Stream assistant response
    await api.streamChat(
      currentConversationId,
      content,
      (chunk) => {
        fullMessage += chunk;
        setStreamingMessage(fullMessage);
      },
      () => {
        // On complete, add the full assistant message
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: fullMessage,
            timestamp: new Date().toISOString(),
          },
        ]);
        setStreamingMessage('');
        setIsStreaming(false);
        
        // Reload conversations to update titles
        loadConversations();
      },
      (error) => {
        setError(error);
        setIsStreaming(false);
        setStreamingMessage('');
      }
    );
  };

  const switchConversation = (conversationId) => {
    setCurrentConversationId(conversationId);
    setStreamingMessage('');
    setIsStreaming(false);
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversationId,
        messages,
        isLoading,
        isStreaming,
        streamingMessage,
        error,
        createConversation,
        deleteConversation,
        sendMessage,
        switchConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

