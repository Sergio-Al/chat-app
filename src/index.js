const path = require("path");
const express = require("express");
const port = process.env.PORT || 3000;

const app = express();


const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// app.get("/", (req, res, next) => {
//   res.sendFile("index");
// });

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
