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

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $messages = document.querySelector("#messages");
// Elements for send location
const $locationButton = document.querySelector("#send-location");

// Templates
// inner catch all element inside #messages-template
const messageTemplate = document.querySelector("#message-template").innerHTML;

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // disable button for prevent double click/send
  // first param for fieldName, second for value,
  // in this case the second disables and the first its the name to access later.
  $messageFormButton.setAttribute("disabled", "disabled");
  // Remember! the name next elements is from a name property in html (in this case message)
  const message = e.target.elements.message.value;

  if (message === "") {
    console.log("nothing to emit!");
    return;
  }
  socket.emit("sendMessage", message, (error) => {
    // enable again
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Message Delivered!");
  });
});

socket.on("message", (message) => {
  console.log("Message: ", message);

  const html = Mustache.render(messageTemplate, { message });
  $messages.insertAdjacentHTML("beforeend", html);
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "location",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      (message) => {
        $locationButton.removeAttribute("disabled");
        console.log("Result", message);
      }
    );
  });
});
