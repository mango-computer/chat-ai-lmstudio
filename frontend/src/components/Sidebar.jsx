import { useChat } from '../contexts/ChatContext';
import { useState } from 'react';

const Sidebar = () => {
  const {
    conversations,
    currentConversationId,
    createConversation,
    deleteConversation,
    switchConversation,
  } = useChat();

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`bg-dark-light border-r border-dark-lighter transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-80'
      } flex flex-col h-full`}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-lighter flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Chat AI
          </h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-dark-lighter rounded-lg transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
            />
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      {!isCollapsed && (
        <div className="p-4">
          <button
            onClick={createConversation}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Chat
          </button>
        </div>
      )}

      {isCollapsed && (
        <div className="p-2">
          <button
            onClick={createConversation}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white p-3 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
            title="New Chat"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          !isCollapsed && (
            <div className="text-gray-400 text-sm text-center p-4">
              No conversations yet
            </div>
          )
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative mb-2 rounded-lg transition-all duration-200 ${
                currentConversationId === conversation.id
                  ? 'bg-dark-lighter'
                  : 'hover:bg-dark-lighter/50'
              }`}
            >
              <button
                onClick={() => switchConversation(conversation.id)}
                className="w-full text-left p-3 flex items-center gap-3"
                title={isCollapsed ? conversation.title : undefined}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0 text-gray-400"
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
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {conversation.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {conversation.message_count} messages
                    </div>
                  </div>
                )}
              </button>
              {!isCollapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete conversation"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;

