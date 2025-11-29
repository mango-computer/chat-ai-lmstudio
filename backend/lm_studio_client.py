from openai import OpenAI
from typing import AsyncIterator
import asyncio

class LMStudioClient:
    def __init__(self, base_url: str = "http://localhost:1234/v1"):
        self.client = OpenAI(
            base_url=base_url,
            api_key="lm-studio"  # LM Studio doesn't require a real API key
        )
    
    async def stream_chat_completion(
        self, 
        messages: list,
        model: str = "local-model",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> AsyncIterator[str]:
        """
        Stream chat completion from LM Studio
        Yields content chunks as they arrive
        """
        try:
            # Run the synchronous OpenAI call in a thread pool
            loop = asyncio.get_event_loop()
            stream = await loop.run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    stream=True
                )
            )
            
            # Stream the response
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            yield f"Error: {str(e)}"
    
    def get_available_models(self):
        """Get list of available models from LM Studio"""
        try:
            models = self.client.models.list()
            return [model.id for model in models.data]
        except Exception as e:
            return []

