"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entity_1 = require("../lib/entity");
const ivy_1 = require("../lib/ivy");
const views_1 = require("../lib/views");
function main() {
    const frame = document.getElementById("frame");
    const person = createPerson();
    const objView = ivy_1.$App.create(views_1.AccordionObjectView);
    person.views.add(objView);
    objView.insert(frame);
}
function createPerson() {
    const person = ivy_1.$App.create(entity_1.Person);
    const group = ivy_1.$App.create(entity_1.Group);
    group.basicInfo.name.primaryName.value = "Maintenance";
    person.basicInfo.name.first.value = "William";
    person.basicInfo.name.middle.value = "Douglas";
    person.basicInfo.name.last.value = "Roller";
    person.basicInfo.personalInfo.birthday.value = new Date(1954, 0, 30);
    person.basicInfo.personalInfo.gender.value = "m";
    const phone = ivy_1.$App.create(entity_1.Phone, person.phones);
    phone.number.value = "417-777-0601";
    phone.preferred.value = true;
    phone.contactType.value = "m";
    person.phones.add(phone);
    let email = ivy_1.$App.create(entity_1.Email, person.emails);
    email.address.value = "w.d.roller@gmail.com";
    email.preferred.value = true;
    email.contactType.value = "p";
    person.emails.add(email);
    email = ivy_1.$App.create(entity_1.Email, person.emails);
    email.address.value = "doug.roller@essets.com";
    email.preferred.value = false;
    email.contactType.value = "w";
    person.emails.add(email);
    let address = ivy_1.$App.create(entity_1.Address, person.addresses);
    address.street1.value = "401 South Avenue APT 302";
    address.city.value = "Springfield";
    address.state.value = "MO";
    address.zip.value = "65806";
    address.preferred.value = true;
    address.contactType.value = "p";
    person.addresses.add(address);
    address = ivy_1.$App.create(entity_1.Address, person.addresses);
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
//# sourceMappingURL=client.js.map