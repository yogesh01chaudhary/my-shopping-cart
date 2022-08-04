const app = require("./app");
require("dotenv").config();

//connect with database
require("./config/database").connect();
const cloudinary = require("cloudinary");

//cloudinary config goes here
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT;
app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
});
