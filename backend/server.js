require("dotenv").config();
const port = process.env.PORT;
const express = require('express');

// Initialize App
const app = express();

// Set up express static folder
app.use(express.static("public"));

// Use Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
// app.use(require("./src/controllers/auth"));
app.use(require("./src/controllers/routes"));

// Start server
app.listen(port, () => {
	console.log(`Y2S listening on ${port}`);
});

module.exports = app;
