import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io(
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5000",
  {
    withCredentials: true,
    extraHeaders: {
      "my-custom-header": "abcd",
    },
  }
);

interface Message {
  text: string;
  sender: "user" | "support";
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [userType, setUserType] = useState<"user" | "support">("user");

  useEffect(() => {
    socket.on("chat history", (history: Message[]) => {
      setMessages(history);
    });

    socket.on("chat message", (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("chat history");
      socket.off("chat message");
    };
  }, []);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      // 假设用户名为 "admin" 的用户为管理员
      setUserType(username === "admin" ? "support" : "user");
    }
  };

  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = { text: message, sender: userType };
    socket.emit("chat message", data);
    setMessage("");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  if (!isLoggedIn) {
    return (
      <div>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li
            key={index}
            className={
              msg.sender === "support" ? "support-message" : "user-message"
            }
          >
            {msg.sender}: {msg.text}
          </li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input type="text" value={message} onChange={handleChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default App;
