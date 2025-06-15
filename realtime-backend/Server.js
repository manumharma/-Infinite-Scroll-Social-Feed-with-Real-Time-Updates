const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend to connect
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  // Listen for new post from celebrity
  socket.on("new_post", (data) => {
    console.log("New post:", data);
    // Broadcast to all public users
    socket.broadcast.emit("receive_post", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
