import { $App, $String, $TextWriter, $Value } from "../s-lib/ivy";
import { Email, Person, Phone } from "../s-lib/person";
import { DataPropertyView as PropView, Select, StringInput } from "../s-lib/views";

function main() {
    let person = createPerson();
    const json: string = person.toJSON();
    person = $App.create<Person>(Person, null);
    person.fromJSON(json);
    const frame = document.getElementById("frame");
    const nameView = $App.create<PropView>(PropView, null);
    nameView.model = person.personalInfo.birthday;
    nameView.insert (frame);
    const dateView = $App.create<PropView>(PropView, null);
    dateView.model = person.personalInfo.age;
    dateView.insert (frame);
    const genderView = $App.create<PropView>(PropView, null);
    genderView.model = person.personalInfo.gender;
    genderView.insert (frame);
}

function createPerson(): Person {
    const person: Person = $App.create<Person>(Person, null);
    person.name.first.value = "William";
    person.name.middle.value = "Douglas";
    person.name.last.value = "Roller";
    person.personalInfo.birthday.value = new Date(1954, 0, 30);
    person.personalInfo.gender.value = "m";
    const phone: Phone = $App.create<Phone>(Phone, person);
    phone.number.value = "417-777-0601";
    phone.preferred.value = true;
    person.contacts.add(phone);
    let email = $App.create<Email>(Email, person);
    email.address.value = "w.d.roller@gmail.com";
    email.preferred.value = true;
    person.contacts.add(email);
    email = $App.create<Email>(Email, person);
    email.address.value = "doug.roller@essets.com";
    email.preferred.value = false;
    person.contacts.add(email);
    return person;
}

main();
