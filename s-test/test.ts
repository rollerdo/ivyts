import { $App, $Collection, $JSONReader, $JSONWriter,  $Object, $Property, $TextWriter, $Writer} from "../s-lib/ivy";
import { Contact, Email, Emails, Person, PersonalInfo as Info, Phones} from "../s-lib/person";
import { PersonalName as Name, Phone } from "../s-lib/person";

// const person: Person = $Property.Create<Person>(Person, undefined);
const person = $App.create<Person>(Person);
const name: Name = person.basicInfo.name;
const info: Info = person.basicInfo.personalInfo;
const phones = person.phones;
const emails = person.emails;

name.first.value = "William";
name.middle.value = "Douglas";
name.last.value = "Roller";
info.birthday.value = new Date(1954, 0, 30);
info.gender.value = "m";

let email: Email = $App.create<Email>(Email, person);
email.address.value = "w.d.roller@gmail.com";
email.contactType.value = "p";
email.preferred.value = true;
emails.add(email);

email = $App.create<Email>(Email, person);
email.address.value = "doug.roller@essets.com";
email.contactType.value = "w";
email.preferred.value = false;
emails.add(email);

const phone = $App.create<Phone>(Phone, person);
phone.number.value = "417-777-0601";
phone.preferred.value = true;
phone.contactType.value = "m";
phones.add(phone);

let writer: any;
writer = new $TextWriter();
const result = writer.write(person, 0);
console.log("\nHuman-readable:\n" + result);

const json = person.toJSON();
console.log("Original JSON:\n" + json);

const newPerson = $App.create<Person>(Person);
newPerson.fromJSON(json);
console.log("\nRe-loaded JSON:\n" + json);
