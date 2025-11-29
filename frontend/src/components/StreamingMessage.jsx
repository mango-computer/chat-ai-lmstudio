const StreamingMessage = ({ content }) => {
  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-dark-lighter text-gray-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="whitespace-pre-wrap break-words">{content}</div>
            <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse-slow"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingMessage;

