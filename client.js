const container = document.getElementById("token-container");

function addMessageToChat(message, role) {
    const lastMessageDiv = chatContainer.lastElementChild;
    const roleClass = 'chat ' + role;

    // Check if the last div exists and has the same role
    if (lastMessageDiv && lastMessageDiv.className === roleClass) {
        // Append the new message to the existing div
        lastMessageDiv.textContent += message; // Use '\n' or any other separator as needed
    } else {
        // Create a new div for the new role
        const messageDiv = document.createElement('div');
        messageDiv.className = roleClass;
        messageDiv.textContent = message;
        chatContainer.appendChild(messageDiv);
    }

    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom
}

messageBuffer = [];

function establishWebsocketConnection() {
    console.log('establishing new websocket connection...');
    ws = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port + "/chat_ws");

    // send any messages waiting in the buffer when the connection is established.
    ws.onopen = function() {
        console.log('Websocket connected');
        messageBuffer.forEach(function(message) {
            ws.send(message);
            console.log('sent buffered message:', message);
        });
        messageBuffer = [];
    };

    // display messages received from the server
    ws.onmessage = function(event) {
        console.log("received message:", event.data);
        addMessageToChat(event.data, "bot");
    };

    // reconnect after 1 second if we detect the connection has dropped
    ws.onclose = function(event) {
        console.log('Websocket closed');
        setTimeout(function() {
            console.log("Websocket attempting reconnect...");
            establishWebsocketConnection();
        }, 1000);
    }

}
document.addEventListener('DOMContentLoaded', function() {
    // initialize the chat
    chatContainer = document.getElementById("chat-container");
    addMessageToChat("Hello, I'm Lao Tzu. What questions about the Tao do you have?", "bot")
    messageInput = document.getElementById("message-input");

    // send messages on enter
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    establishWebsocketConnection();
});

function sendMessage() {
    const message = messageInput.value;

    // don't send an empty message to the server
    if ( !message ) return;

    // 
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        console.log('sent message:', message);
    } else {
        console.log('buffering message...');
        messageBuffer.push(message);
    }

    // display the user's message in the chat history
    addMessageToChat(message, "user");

    // Clear input after sending
    messageInput.value = '';  
}
