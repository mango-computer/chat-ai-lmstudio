import { ChatProvider } from './contexts/ChatContext';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-dark text-gray-100">
        <Sidebar />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}

export default App;
