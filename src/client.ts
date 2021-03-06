import { EssetsApp } from "./essets/app";
import { Address, Contact, Email, Person, Persons, Phone } from "./essets/entity";
import { $Boolean, $ivy, $String, $TextWriter, $Value } from "./lib/ivy";
import { AccObjectFolder, Accordion, Select, StringInput } from "./lib/views";

// Called from last line below
function main() {
    getData();
}

function getData() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            createApp(this.responseText);
        }
    };
    xhttp.open("GET", "http://localhost:8080/appdata", true);
    xhttp.send();
}

function createApp(json: string): void {
    const app: EssetsApp = $ivy<EssetsApp>(EssetsApp);
    const frame = document.getElementById("frame");
    const objView = $ivy<Accordion>(Accordion);
    app.fromJSON(json);
    objView.model = app.dataSet.persons.toArray()[0];
    objView.insert(frame);
    console.log(objView.toArray().length);
}

main();
