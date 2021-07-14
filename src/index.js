const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

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

  // Event listener for create a new room
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    // Create a new room from the connection
    // now the behavior of emit and broadcast will be the following inside of every rooms:
    // io.to.emit - to emit messages to everybody in a particular room.
    // socket.broadcast.to.emit -  to emit broadcast behavior on a particular room connected.
    socket.join(user.room);

    socket.emit("message", generateMessage("Welcome!"));

    // emit an event to everyone except for this connection
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined!`));

    callback();
  });

  // Event listener 'sendMessage'
  socket.on("sendMessage", (msg, callback) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback("profanity is not allowed!");
    }

    io.to("js").emit("message", generateMessage(msg));
    callback("delivered!");
  });

  socket.on("location", (msg, callback) => {
    const url = `https://google.com/maps?q=${msg.lat},${msg.long}`;
    io.emit("locationMessage", generateLocationMessage(url));
    callback("your location has been shared!");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left the room!`)
      );
    }
  });
});

// This is for lister our http server
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
