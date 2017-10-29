import { $App, $Boolean, $String, $TextWriter, $Value } from "../s-lib/ivy";
import { Address, Email, Person, Phone } from "../s-lib/person";
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
    const objView = $App.create<ObjectView>(ObjectView);
    person.views.add(objView);
    objView.insert(frame);
    objView.refresh();
}

function createPerson(): Person {
    const person: Person = $App.create<Person>(Person);
    person.basicInfo.name.first.value = "William";
    person.basicInfo.name.middle.value = "Douglas";
    person.basicInfo.name.last.value = "Roller";
    person.basicInfo.personalInfo.birthday.value = new Date(1954, 0, 30);
    person.basicInfo.personalInfo.gender.value = "m";
    const phone: Phone = $App.create<Phone>(Phone, person);
    phone.number.value = "417-777-0601";
    phone.preferred.value = true;
    phone.contactType.value = "m";
    person.phones.add(phone);
    let email = $App.create<Email>(Email, person);
    email.address.value = "w.d.roller@gmail.com";
    email.preferred.value = true;
    email.contactType.value = "p";
    person.email.add(email);
    email = $App.create<Email>(Email, person);
    email.address.value = "doug.roller@essets.com";
    email.preferred.value = false;
    email.contactType.value = "w";
    person.email.add(email);
    let address = $App.create<Address>(Address, person);
    address.street1.value = "401 South Avenue APT 302";
    address.city.value = "Springfield";
    address.state.value = "MO";
    address.zip.value = "65806";
    address.preferred.value = true;
    address.contactType.value = "pri";
    person.addresses.add(address);
    address = $App.create<Address>(Address, person.addresses);
    address.street1.value = "238 Saint Marks Avenue";
    address.street2.value = "#6B";
    address.city.value = "Brooklyn";
    address.state.value = "NY";
    address.zip.value = "11238";
    address.contactType.value = "sec";
    person.addresses.add(address);
    return person;
}

main();
