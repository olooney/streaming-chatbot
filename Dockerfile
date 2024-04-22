# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install nginx
RUN apt-get update && apt-get install -y nginx

# Install any needed packages specified in requirements.txt
RUN pip install fastapi uvicorn[standard] python-multipart aiofiles openai pyyaml

# Set the working directory in the container
WORKDIR /app

# Copy the server files into the container
COPY server.py ./server/
COPY utils.py ./server/
COPY azure_credentials.yaml ./server/

# Copy the client files into the container
COPY index.html /var/www/html/
COPY client.js /var/www/html/
COPY style.css /var/www/html/

# Setup Nginx to serve static files and reverse proxy to Uvicorn
RUN rm /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/nginx.conf /etc/nginx/sites-enabled/

# Expose the port nginx is reachable on
EXPOSE 80

# Run nginx and Uvicorn on container startup
WORKDIR /app/server
CMD service nginx start && uvicorn server:app --host 0.0.0.0 --port 8000

