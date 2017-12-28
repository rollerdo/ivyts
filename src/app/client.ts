import { Address, Email, Group, Person, Persons, Phone } from "../lib/entity";
import { $App, $Boolean, $String, $TextWriter, $Value } from "../lib/ivy";
import { AccordionObjectView, Select, StringInput } from "../lib/views";

function main() {
    const frame = document.getElementById("frame");
    const person = createPerson();
    const objView = $App.create<AccordionObjectView>(AccordionObjectView);
    const persons: Persons = $App.create<Persons>(Persons);
    person.views.add(objView);
    objView.insert(frame);
}

function loadDoc() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById("demo").innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", "ajax_info.txt", true);
    xhttp.send();
}

function createPerson(): Person {
    const person: Person = $App.create<Person>(Person);
    const group: Group = $App.create<Group>(Group);
    group.basicInfo.name.primaryName.value = "Maintenance";
    person.basicInfo.name.first.value = "Williams";
    person.basicInfo.name.middle.value = "Douglas";
    person.basicInfo.name.last.value = "Roller";
    person.basicInfo.personalInfo.birthday.value = new Date(1954, 0, 30);
    person.basicInfo.personalInfo.gender.value = "m";
    const phone: Phone = $App.create<Phone>(Phone, person.phones);
    phone.number.value = "417-777-0601";
    phone.preferred.value = true;
    phone.contactType.value = "m";
    person.phones.add(phone);
    let email = $App.create<Email>(Email, person.emails);
    email.address.value = "w.d.roller@gmail.com";
    email.preferred.value = true;
    email.contactType.value = "p";
    person.emails.add(email);
    email = $App.create<Email>(Email, person.emails);
    email.address.value = "doug.roller@essets.com";
    email.preferred.value = false;
    email.contactType.value = "w";
    person.emails.add(email);
    let address = $App.create<Address>(Address, person.addresses);
    address.street1.value = "401 South Avenue APT 302";
    address.city.value = "Springfield";
    address.state.value = "MO";
    address.zip.value = "65806";
    address.preferred.value = true;
    address.contactType.value = "p";
    person.addresses.add(address);
    address = $App.create<Address>(Address, person.addresses);
    address.street1.value = "238 Saint Marks Avenue";
    address.street2.value = "#6B";
    address.city.value = "Brooklyn";
    address.state.value = "NY";
    address.zip.value = "11238";
    address.contactType.value = "s";
    person.addresses.add(address);
    return person;
}

main();
