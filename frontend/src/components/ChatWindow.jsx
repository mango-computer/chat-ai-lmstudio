import { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import Message from './Message';
import StreamingMessage from './StreamingMessage';
import MessageInput from './MessageInput';

const ChatWindow = () => {
  const {
    messages,
    isLoading,
    isStreaming,
    streamingMessage,
    error,
    sendMessage,
    currentConversationId,
  } = useChat();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  if (!currentConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to Chat AI
          </h2>
          <p className="text-gray-400 mb-6">
            Start a new conversation to begin chatting with AI powered by LM Studio
          </p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>✨ Real-time streaming responses</p>
            <p>💬 Multiple conversation management</p>
            <p>🎨 Beautiful and modern interface</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-dark h-full">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading messages...
            </div>
          </div>
        ) : messages.length === 0 && !streamingMessage ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Send a message to start the conversation</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}
            {isStreaming && streamingMessage && (
              <StreamingMessage content={streamingMessage} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <MessageInput onSendMessage={sendMessage} disabled={isStreaming} />
    </div>
  );
};

export default ChatWindow;

