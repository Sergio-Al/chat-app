const socket = io();

// our name event "countUpdated" must be equal that the server event "countUpdated"
// the name of count must optional.
socket.on("countUpdated", (count) => {
  console.log("the count has been updated", count);
});

document.querySelector("#increment").addEventListener("click", () => {
  console.log("Clicked");
  // this emit is from the client.
  socket.emit("increment")
});
