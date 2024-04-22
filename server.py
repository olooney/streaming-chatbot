import time
import re
import asyncio
from typing import List, AsyncGenerator

from utils import Config

from openai import OpenAI
from openai import AzureOpenAI, AsyncAzureOpenAI

from fastapi import FastAPI, WebSocket
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

# instantiate OpenAI client
credentials = Config.load('azure_credentials.yaml')
client = AsyncAzureOpenAI(
    api_key=credentials.api_key,
    api_version=credentials.api_version,
    azure_endpoint=credentials.endpoint,
)

# create the app server
app = FastAPI()


def new_messages() -> List[str]:
    '''Creates a new message history with just the system prompt and greeting.
    '''
    return [
        {'role': 'system', 'content': 'You are ChatGPT, and helpful AI assistant.'},
        {'role': 'assistant', 'content': 'Hello, I\'m ChatGPT. How may I help you?'},
    ]


async def chat_iterator(messages: List, prompt: str) -> AsyncGenerator[str, None]:
    '''For a given chat history (messages) and a new prompt, chat_iterator()
    connects to the OpenAI client and streams the response back as an async
    iterator.  The messages list will be mutated to include both the user and
    assistant prompts.
    '''
    messages.append({'role': 'user', 'content': prompt})

    streaming_response = await client.chat.completions.create(
        model=credentials.deployment_name,
        stream=True,
        messages=messages)

    response = ''
    async for chunk in streaming_response:
        for choice in chunk.choices:
            if choice.delta.content:
                response += choice.delta.content
                yield choice.delta.content
    messages.append({'role': 'assistant', 'content': response})
    print('ASSISTANT:', response)


async def chat_listener(websocket: WebSocket):
    '''Every time the user sends a new message, create a new chat_iterator and
    stream the response to the client.
    '''
    await websocket.accept()
    messages = new_messages()

    try:
        while True:
            user_message = await websocket.receive_text()
            print('USER:', user_message)
            async for message in chat_iterator(messages, user_message):
                await websocket.send_text(message)
                await asyncio.sleep(0.05)
    except Exception as e:
        print(e)


@app.websocket('/chat_ws')
async def websocket_endpoint(websocket: WebSocket):
    await chat_listener(websocket)
