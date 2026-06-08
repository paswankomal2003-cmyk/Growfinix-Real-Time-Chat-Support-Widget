const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e7,
});

let allMessages = [];

function getBotReply(message) {
  const msg = message.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! Welcome to AI Support. How can I assist you today?";
  }

  if (msg.includes("login")) {
    return "For login issues, please check your username and password.";
  }

  if (msg.includes("price") || msg.includes("pricing")) {
    return "Our pricing depends on your selected plan. Please contact our team.";
  }

  if (msg.includes("error") || msg.includes("bug")) {
    return "Please share the error screenshot or message so we can help you.";
  }

  if (msg.includes("contact")) {
    return "You can contact us through email, live chat, or the contact form.";
  }

  if (msg.includes("thank")) {
    return "You're welcome! Happy to help.";
  }

  return "Thank you for your message. Our support assistant will help you shortly.";
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("admin_join", () => {
    socket.emit("admin_history", allMessages);
  });

  socket.on("send_message", (data) => {
    allMessages.push(data);

    io.emit("receive_message", data);
    io.emit("admin_new_message", data);

    if (data.type !== "file") {
      socket.emit("bot_typing");

      setTimeout(() => {
        const aiReply = {
          sender: "ai",
          username: "AI Support",
          text: getBotReply(data.text),
          type: "text",
          time: new Date().toLocaleTimeString(),
        };

        allMessages.push(aiReply);

        io.emit("receive_message", aiReply);
        io.emit("admin_new_message", aiReply);
        socket.emit("bot_stop_typing");
      }, 1000);
    }
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("user_typing", username);
  });

  socket.on("stop_typing", () => {
    socket.broadcast.emit("user_stop_typing");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});