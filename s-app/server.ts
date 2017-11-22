import express = require("express");

const app = express();

app.use(express.static(__dirname));

import { $App, $Collection, $JSONReader, $JSONWriter,  $Object, $Property, $TextWriter, $Writer} from "../s-lib/ivy";
import { Addresses, Email, Emails, Person, PersonalInfo as Info, Phones} from "../s-lib/person";
import { PersonalName as Name, Phone } from "../s-lib/person";

const person = $App.create<Person>(Person);
const name: Name = person.basicInfo.name;
const info: Info = person.basicInfo.personalInfo;
const emails: Emails = person.emails;
const phones: Phones = person.phones;

name.first.value = "William";
name.middle.value = "Douglas";
name.last.value = "Roller";
info.birthday.value = new Date(1954, 0, 30);
info.gender.value = "m";

let email: Email = $App.create<Email>(Email, person.emails);
email.address.value = "w.d.roller@gmail.com";
email.contactType.value = "p";
email.preferred.value = true;
emails.add(email);

email = $App.create<Email>(Email, person.emails);
email.address.value = "doug.roller@essets.com";
email.contactType.value = "w";
email.preferred.value = false;
emails.add(email);

const phone = $App.create<Phone>(Phone, person.phones);
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

app.get("/view", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

console.log("Server listening on port 8080");
app.listen(8080);
