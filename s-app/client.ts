import { $String, $Value } from "../s-lib/ivy";
import { Person } from "../s-lib/person";
import { DataPropertyView, Select, StringInput } from "../s-lib/views";

export function main() {
    const person: Person = new Person().init();
    person.name.first.value = "William";
    (person.name.properties.byName("middle") as $Value).value = "Douglas";
    (person.name.properties.toArray()[2] as $Value).value = "Roller";
    const frame = document.getElementById("frame");
    const nameView = new DataPropertyView(null).init();
    const gender = new $String(null).init();
    gender.caption = "Gender";
    const genderView = new DataPropertyView(null).init();
    gender.options = {1: "Female", 2: "Male"};
//    gender.options = [{value: "F", display: "Female"}, {value: "M", display: "Male"}];
    nameView.model = person.name.first;
    nameView.insert(frame);
//    nameView.refresh();
    genderView.model = gender;
    genderView.insert(frame);
//    genderView.refresh();
}

main();
