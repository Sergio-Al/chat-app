const socket = io();

// // our name event "countUpdated" must be equal that the server event "countUpdated"
// // the name of count must optional.
// socket.on("countUpdated", (count) => {
//   console.log("the count has been updated", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("Clicked");
//   // this emit is from the client.
//   socket.emit("increment")
// });

function sendMessage() {
  const message = document.getElementById("msgInput").value;
  if (message === "") {
    console.log("nothing to emit!");
    return;
  }
  socket.emit("sendMessage", message, (error) => {
    if (error) {
      return console.log(error);
    }

    console.log("Message Delivered!");
  });
}

socket.on("receivedMsg", (msg) => {
  console.log("Message: ", msg);
});

socket.on("message", (message) => {
  console.log("Message: ", message);
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "location",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      (message) => {
        console.log("Result", message);
      }
    );
  });
});
