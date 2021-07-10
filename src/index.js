const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
// this is for create a new server explicitly, beacuse express create a one for us but we haven't access to it.
const server = http.createServer(app);
// We pass out created server
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

// socket is an object containing info about socket connection
io.on("connection", (socket) => {
  console.log("new web socket connection");

  // // Event
  // // we pass the count value as callback to return a value.
  // socket.emit("countUpdated", count);

  // socket.on("increment", () => {
  //   count++;
  //   // This is going to emit to a single connection
  //   //socket.emit("countUpdated", count);
  //   // this is going to emit to every connection
  //   io.emit("countUpdated", count);
  // });

  socket.emit("message", "Welcome to the connection!");

  // emit an event to everyone except for this connection
  socket.broadcast.emit("message", "A new user has joined!");

  socket.on("sendMessage", (msg) => {
    io.emit("receivedMsg", msg);
  });

  socket.on("location", (msg) => {
    io.emit("receivedMsg", `https://google.com/maps?q=${msg.lat},${msg.long}`);
  });

  socket.on("disconnect", () => {
    io.emit("message", "An user has left!");
  });
});

// This is for lister our http server
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
