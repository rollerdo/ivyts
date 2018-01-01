import { EssetsApp } from "./essets/app";
import { Address, Contact, Email, Person, Persons, Phone } from "./essets/entity";
import { $Boolean, $ivy, $String, $TextWriter, $Value } from "./lib/ivy";
import { AccordionObjectView, Select, StringInput} from "./lib/views";

// Called from last line below
function main() {
    getData();
}

function getData() {
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
    const objView = $ivy<AccordionObjectView>(AccordionObjectView);
    const app: EssetsApp = $ivy<EssetsApp>(EssetsApp);
    app.persons.fromJSON(json);
    const person: Person = app.persons.toArray()[1];
    person.views.add(objView);
    objView.insert(frame);
}

main();