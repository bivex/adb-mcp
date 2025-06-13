/* MIT License
 *
 * Copyright (c) 2025 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { transports: ["websocket"] });

const PORT = 3001;

/**
 * Tracks clients by application using a Map for better performance.
 * @type {Map<string, Set<string>>}
 */
const applicationClients = new Map();

/**
 * Registers a client for a specific application.
 * @param {string} application
 * @param {string} socketId
 */
const registerClient = (application, socketId) => {
  if (!applicationClients.has(application)) {
    applicationClients.set(application, new Set());
  }
  applicationClients.get(application).add(socketId);
};

/**
 * Removes a client from all application registrations.
 * @param {string} socketId
 */
const removeClient = (socketId) => {
  for (const [app, clients] of applicationClients.entries()) {
    clients.delete(socketId);
    if (clients.size === 0) {
      applicationClients.delete(app);
    }
  }
};

/**
 * Sends a packet to all clients registered for a specific application.
 * @param {object} packet
 * @returns {boolean}
 */
const sendToApplication = (packet) => {
  const { application, senderId } = packet;
  const clients = applicationClients.get(application);
  if (clients && clients.size > 0) {
    console.log(`Sending to ${clients.size} clients for ${application}`);
    clients.forEach(clientId => {
      io.to(clientId).emit('command_packet', packet);
    });
    return true;
  }
  console.log(`No clients registered for application: ${application}`);
  return false;
};

/**
 * Validates that a value is a non-empty string.
 * @param {any} value
 * @returns {boolean}
 */
const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;

// Middleware for logging connections/disconnections
io.use((socket, next) => {
  console.log(`Socket middleware: ${socket.id}`);
  next();
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('register', ({ application }) => {
    if (!isNonEmptyString(application)) {
      socket.emit('registration_response', {
        type: 'registration',
        status: 'error',
        message: 'Invalid application name.'
      });
      return;
    }
    registerClient(application, socket.id);
    socket.data.application = application;
    socket.emit('registration_response', {
      type: 'registration',
      status: 'success',
      message: `Registered for ${application}`
    });
    console.log(`Client ${socket.id} registered for application: ${application}`);
  });

  socket.on('command_packet_response', ({ packet }) => {
    if (!packet || !isNonEmptyString(packet.senderId)) {
      console.log('Invalid packet or missing senderId in command_packet_response');
      return;
    }
    io.to(packet.senderId).emit('packet_response', packet);
    console.log(`Sent confirmation to client ${packet.senderId}`);
  });

  socket.on('command_packet', ({ application, command }) => {
    if (!isNonEmptyString(application) || typeof command !== 'object') {
      console.log('Invalid application or command in command_packet');
      return;
    }
    const packet = {
      senderId: socket.id,
      application,
      command
    };
    sendToApplication(packet);
    console.log(`Command from ${socket.id} for application ${application}:`, command);
  });

  socket.on('disconnect', () => {
    removeClient(socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`adb-mcp Command proxy server running on ws://localhost:${PORT}`);
});