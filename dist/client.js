"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entity_1 = require("./essets/entity");
const ivy_1 = require("./lib/ivy");
const views_1 = require("./lib/views");
function main() {
    loadDoc();
}
function loadDoc() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            createPerson(this.responseText);
        }
    };
    xhttp.open("GET", "http://localhost:8080/persons", true);
    xhttp.send();
}
function createPerson(json) {
    const frame = document.getElementById("frame");
    const objView = ivy_1.$App.create(views_1.AccordionObjectView);
    const persons = ivy_1.$App.create(entity_1.Persons);
    persons.fromJSON(json);
    const person = persons.toArray()[1];
    person.views.add(objView);
    objView.insert(frame);
}
main();
//# sourceMappingURL=client.js.map