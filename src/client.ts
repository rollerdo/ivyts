import { Address, Contact, Email, Person, Persons, Phone } from "./essets/entity";
import { $App, $Boolean, $String, $TextWriter, $Value } from "./lib/ivy";
import { AccordionObjectView, Select, StringInput} from "./lib/views";

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

function createPerson(json: string): void {
    const frame = document.getElementById("frame");
    const objView = $App.create<AccordionObjectView>(AccordionObjectView);
    const persons: Persons = $App.create<Persons>(Persons);
    persons.fromJSON(json);
    const person: Person = persons.toArray()[1];
    person.views.add(objView);
    objView.insert(frame);
}

main();
