const API_BASE_URL = 'http://localhost:8000';

export const api = {
  // Conversations
  async getConversations() {
    const response = await fetch(`${API_BASE_URL}/api/conversations`);
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
  },

  async createConversation(title = 'New Conversation') {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
  },

  async deleteConversation(conversationId) {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete conversation');
    return response.json();
  },

  async getMessages(conversationId) {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  // Streaming chat
  async streamChat(conversationId, message, onChunk, onComplete, onError) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data.trim()) {
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  onChunk(parsed.content);
                } else if (parsed.status === 'completed') {
                  onComplete();
                } else if (parsed.error) {
                  onError(parsed.error);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      onError(error.message);
    }
  },

  async getModels() {
    const response = await fetch(`${API_BASE_URL}/api/models`);
    if (!response.ok) throw new Error('Failed to fetch models');
    return response.json();
  },
};

