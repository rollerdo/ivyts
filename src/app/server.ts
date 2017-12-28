import express = require("express");
import fs = require("fs");

const app = express();

app.use(express.static(__dirname));
app.use(express.static(__dirname + "/public"));

const dirName: string = __dirname;

app.get("/hello", function (req, res) {
    res.send("Hello, World");
});

app.get("/persons", function (req, res) {
    res.sendFile(dirName + "/private/persons.json");
});

app.get("/", function (req, res) {
    res.sendFile(dirName + "/private/index.html");
});

console.log("Server listening on port 8080");
app.listen(8080);
