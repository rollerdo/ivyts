import { $String, $TextWriter, $Value } from "../s-lib/ivy";
import { Email, Person, Phone } from "../s-lib/person";
import { DataPropertyView, Select, StringInput } from "../s-lib/views";

function main() {
    const person = createPerson().init();
    const frame = document.getElementById("frame");
    const nameView = new DataPropertyView(null).init();
    nameView.model = person.personalInfo.birthday;
    nameView.insert (frame);
    nameView.refresh();
    const dateView = new DataPropertyView(null).init();
    dateView.model = person.personalInfo.age;
    dateView.insert (frame);
    dateView.refresh();
}

function createPerson(): Person {
    const person: Person = new Person().init();
    person.name.first.value = "William";
    person.name.middle.value = "Douglas";
    person.name.last.value = "Roller";
    person.personalInfo.birthday.value = new Date(1954, 0, 30);
    const phone: Phone = new Phone().init();
    phone.number.value = "417-777-0601";
    phone.preferred.value = true;
    person.contacts.add(phone);
    let email = new Email();
    email.address.value = "w.d.roller@gmail.com";
    email.preferred.value = true;
    person.contacts.add(email);
    email = new Email();
    email.address.value = "doug.roller@essets.com";
    email.preferred.value = false;
    person.contacts.add(email);
    return person;
}

main();
