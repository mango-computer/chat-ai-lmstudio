import { useState } from 'react';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-dark-lighter bg-dark-light">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              disabled={disabled}
              rows={1}
              className="w-full bg-dark-lighter text-gray-100 placeholder-gray-400 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] max-h-[200px]"
              style={{
                height: 'auto',
                minHeight: '52px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 disabled:from-gray-600 disabled:to-gray-600 text-white p-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex-shrink-0 h-[52px] w-[52px] flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {disabled ? (
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
            ) : (
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </form>
  );
};

export default MessageInput;

