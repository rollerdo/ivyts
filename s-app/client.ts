import { $App, $Boolean, $String, $TextWriter, $Value } from "../s-lib/ivy";
import { Email, Person, Phone } from "../s-lib/person";
import { DataPropertyView, ObjectView, Select, StringInput } from "../s-lib/views";

function main() {
    const frame = document.getElementById("frame");
/*
    const myBool = new $Boolean(undefined);
    myBool.value = true;
    const myView = $App.create<DataPropertyView>(DataPropertyView, undefined);
    myBool.views.add(myView);
    myView.insert(frame);
    const myString = new $String(undefined);
    myString.value = "testing";
    const myStrView = $App.create<DataPropertyView>(DataPropertyView, undefined);
    myString.views.add(myStrView);
    myStrView.insert(frame);
*/
    const person = createPerson();
    const objView = $App.create<ObjectView>(ObjectView, null);
    person.views.add(objView);
    objView.insert(frame);
    objView.refresh();
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
    phone.phoneType.value = "m";
    person.contacts.add(phone);
    let email = $App.create<Email>(Email, person);
    email.address.value = "w.d.roller@gmail.com";
    email.preferred.value = true;
    email.emailType.value = "p";
    person.contacts.add(email);
    email = $App.create<Email>(Email, person);
    email.address.value = "doug.roller@essets.com";
    email.preferred.value = false;
    email.emailType.value = "w";
    person.contacts.add(email);
    return person;
}

main();
