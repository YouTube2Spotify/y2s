require("dotenv").config();
const port = 3000;
const express = require("express");
var cors = require("cors");

// Routes
const vidProcess = require("./src/controllers/vidProcess");

// Initialize App
const app = express();

// Use Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use(cors());
app.use("/api", vidProcess);

app.get("/", (req, res) => {
	return res.json({ response: "Hello World" });
});

// Start server
app.listen(port, () => {
	console.log(`Y2S listening on ${port}`);
});

module.exports = app;
