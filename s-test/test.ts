import { $Collection, $JSONReader, $JSONWriter,  $Object, $Property, $TextWriter, $Writer} from "../s-lib/ivy";
import { Contact, Contacts, Email, Fax, Person, PersonalInfo as Info} from "../s-lib/person";
import { PersonalName as Name, Phone } from "../s-lib/person";

// const person: Person = $Property.Create<Person>(Person, null);
const person = new Person(null).init();
const name: Name = person.name;
const info: Info = person.personalInfo;
const contactInfo: Contacts = person.contacts;

name.first.value = "William";
name.middle.value = "Douglas";
name.last.value = "Roller";
info.birthday.value = new Date(1954, 0, 30);

let email: Email = new Email(contactInfo).init();
email.address.value = "w.d.roller@gmail.com";
email.preferred.value = true;
contactInfo.add(email);

email = new Email().init();
email.address.value = "doug.roller@essets.com";
email.preferred.value = false;
contactInfo.add(email);

const phone = new Phone().init();
phone.number.value = "417-777-0601";
phone.preferred.value = true;
phone.phoneType.value = "mobile";
contactInfo.add(phone);

const fax = new Fax().init();
fax.phoneNumber.value = "417-777-2221";
fax.preferred.value = true;
fax.phoneType.value = "fax";
contactInfo.add(fax);

let writer: any;
writer = new $TextWriter();
const result = writer.write(person, 0);
console.log("\nHuman-readable:\n" + result);

writer = new $JSONWriter();
let json = writer.write(person);
console.log("Original JSON:\n" + json);

const newPerson = new Person().init();
const reader = new $JSONReader();
reader.read(newPerson, JSON.parse(json));
json = writer.write(newPerson);
console.log("\nRe-loaded JSON:\n" + json);
