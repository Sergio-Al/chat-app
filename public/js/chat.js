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
const userLocationTemplate = document.querySelector(
  "#user-location-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
// ignoreQueryPrefix is for '?' at the beginning of our query as param in html send form
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  $newMessage = $messages.lastElementChild;

  // Height of the last message
  const newMessagesStyles = getComputedStyle($newMessage);
  const newMessagesMargin = parseInt(newMessagesStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessagesMargin;

  // Visble height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight
  
  // How far have i scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
};

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
    setTimeout(() => {
      $messageFormButton.removeAttribute("disabled");
    }, 2000);
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

socket.on("locationMessage", (message) => {
  console.log(message.url);

  const html = Mustache.render(userLocationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  // Our autoscroll feature
  autoscroll();
});

socket.on("message", (message) => {
  console.log("Message: ", message.text);

  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  // Our autoscroll feature
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
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
      (error) => {
        if (error) {
          return console.log(error);
        }

        $locationButton.removeAttribute("disabled");
        console.log("Location Send");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
