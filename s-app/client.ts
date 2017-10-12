import { $Value } from "../s-lib/ivy";
import { Person } from "../s-lib/person";
import { DataPropertyView, StringInput } from "../s-lib/views";

export function main() {
    const person: Person = new Person().init();
    person.name.first.value = "William";
    (person.name.properties.byName("middle") as $Value).value = "Douglas";
    (person.name.properties.toArray()[2] as $Value).value = "Roller";
    const frame = document.getElementById("frame");
    const name = new DataPropertyView(null).init();
    name.model.value = person.name.first;
    name.construct();
    name.insert(frame);
    name.refresh();
}

main();
