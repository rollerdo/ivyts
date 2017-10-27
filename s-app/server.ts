import express = require("express");

const app = express();

app.use(express.static(__dirname));

import { $App, $Collection, $JSONReader, $JSONWriter,  $Object, $Property, $TextWriter, $Writer} from "../s-lib/ivy";
import { Contact, Contacts, Email, Person, PersonalInfo as Info} from "../s-lib/person";
import { PersonalName as Name, Phone } from "../s-lib/person";

const person = $App.create<Person>(Person);
const name: Name = person.basicInfo.name;
const info: Info = person.basicInfo.personalInfo;
const contactInfo: Contacts = person.contactInfo;

name.first.value = "William";
name.middle.value = "Douglas";
name.last.value = "Roller";
info.birthday.value = new Date(1954, 0, 30);

let email: Email = $App.create<Email>(Email, person);
email.address.value = "w.d.roller@gmail.com";
email.preferred.value = true;
contactInfo.add(email);

email = $App.create<Email>(Email, person);
email.address.value = "doug.roller@essets.com";
email.preferred.value = false;
contactInfo.add(email);

const phone = $App.create<Phone>(Phone, person);
phone.number.value = "417-777-0601";
phone.preferred.value = true;
phone.contactType.value = "mobile";
contactInfo.add(phone);

app.get("/hello", function (request, response) {
    response.send("Hello, World");
});

app.get("/person", function (request, response) {
    response.send(person.toJSON());
});

app.get("/view", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

console.log("Server listening on port 8080");
app.listen(8080);
