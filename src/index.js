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

io.on("connection", () => {
  console.log("new web socket connection");
});

// This is for lister our http server
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
