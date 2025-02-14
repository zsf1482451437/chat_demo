import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

interface ChatMessage {
  message: string;
  timestamp: number;
  sender: 'user' | 'support';
}

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

let chatHistory: ChatMessage[] = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.emit('chat history', chatHistory);

  socket.on('chat message', (msg: ChatMessage) => {
    chatHistory.push(msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(5000, () => {
  console.log('listening on *:5000');
});
