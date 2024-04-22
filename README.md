# Async Chat Demo

This project demonstrates a real-time chat application using FastAPI,
WebSocket, and Nginx within a Docker environment. It showcases how to handle
WebSocket connections for asynchronous communication between the client and a
server-side chatbot.

## Features

- **Real-time Communication**: Utilizes WebSockets for live messaging.
- **Docker Integration**: Simplifies deployment and environment setup.
- **Nginx Reverse Proxy**: Efficiently manages static content and WebSocket connections.

## Requirements

- Docker
- Docker Compose (optional for easier management)
- Python 3.10
- Web browser with WebSocket support

## Setup

### 1. Clone the Repository

```bash
git clone https://your-repository-url.git
cd streaming_docker
cp credentials.example.yaml azure_credentials.yaml
# edit azure_credentials.yaml to include your keys
```

### 2. Build and Run

```bash
docker build -t chatbot-server .
docker run -p 8080:80 chatbot-server
```

Visit http://localhost:8080 to interact with the demo.



