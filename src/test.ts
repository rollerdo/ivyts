import { Contact, Email, Emails, Group, GroupInfo, GroupName, Person, PersonalInfo as Info} from "./lib/entity";
import { PersonalName as Name, Phone } from "./lib/entity";
import { $App, $Collection, $JSONReader, $JSONWriter,  $Object, $Property, $TextWriter, $Writer} from "./lib/ivy";

// const person: Person = $Property.Create<Person>(Person, undefined);
const person = $App.create<Person>(Person);
const name: Name = person.basicInfo.name;
const info: Info = person.basicInfo.personalInfo;
const phones = person.phones;
const emails = person.emails;

const group = $App.create<Group>(Group);
const gname: GroupName = group.basicInfo.name;
const ginfo: GroupInfo = group.basicInfo.groupInfo;
const gphones = group.phones;
const gemails = group.emails;

name.first.value = "William";
name.middle.value = "Douglas";
name.last.value = "Roller";
info.birthday.value = new Date(1954, 0, 30);
info.gender.value = "m";
gname.primaryName.value = "eSSETS";
ginfo.groupType.value = "team";

let email: Email = $App.create<Email>(Email, person);
email.address.value = "w.d.roller@gmail.com";
email.contactType.value = "p";
email.preferred.value = true;
emails.add(email);
gemails.add(email);

email = $App.create<Email>(Email, person);
email.address.value = "doug.roller@essets.com";
email.contactType.value = "w";
email.preferred.value = false;
emails.add(email);
gemails.add(email);

const phone = $App.create<Phone>(Phone, person);
phone.number.value = "417-777-0601";
phone.preferred.value = true;
phone.contactType.value = "m";
phones.add(phone);
gphones.add(phone);

console.log("\nGroup JSON:\n" + group.toJSON());

let writer: any;
writer = new $TextWriter();
const result = writer.write(person, 0);
console.log("\nHuman-readable:\n" + result);

const json = person.toJSON();
console.log("Original JSON:\n" + json);

const newPerson = $App.create<Person>(Person);
newPerson.fromJSON(json);
console.log("\nRe-loaded JSON:\n" + json);
