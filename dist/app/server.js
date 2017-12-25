"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
app.use(express.static(__dirname));
app.use(express.static(__dirname + "/public"));
const dirName = __dirname;
const entity_1 = require("../lib/entity");
const entity_2 = require("../lib/entity");
const ivy_1 = require("../lib/ivy");
const person = ivy_1.$App.create(entity_1.Person);
const name = person.basicInfo.name;
const info = person.basicInfo.personalInfo;
const emails = person.emails;
const phones = person.phones;
name.first.value = "William";
name.middle.value = "Douglas";
name.last.value = "Roller";
info.birthday.value = new Date(1954, 0, 30);
info.gender.value = "m";
let email = ivy_1.$App.create(entity_1.Email, person.emails);
email.address.value = "w.d.roller@gmail.com";
email.contactType.value = "p";
email.preferred.value = true;
emails.add(email);
email = ivy_1.$App.create(entity_1.Email, person.emails);
email.address.value = "doug.roller@essets.com";
email.contactType.value = "w";
email.preferred.value = false;
emails.add(email);
const phone = ivy_1.$App.create(entity_2.Phone, person.phones);
phone.number.value = "417-777-0601";
phone.preferred.value = true;
phone.contactType.value = "w";
phones.add(phone);
app.get("/hello", function (request, response) {
    response.send("Hello, World");
});
app.get("/person", function (request, response) {
    response.send(person.toJSON());
});
app.get("/", function (req, res) {
    res.sendFile(dirName + "/private/index.html");
});
console.log("Server listening on port 8080");
app.listen(8080);
//# sourceMappingURL=server.js.map