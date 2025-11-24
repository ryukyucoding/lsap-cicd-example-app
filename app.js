// app.js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res
    .status(200)
    .send("<h1>Welcome to the CI/CD Workshop!</h1>");
});

app.get('/time', (req, res) => {
  res.json({ 
      time: new Date().toISOString() 
  });
});

module.exports = app;
