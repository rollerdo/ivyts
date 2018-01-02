import fs = require("fs");
import { EssetsApp } from "./essets/app";
import { Contact, Email, Emails, Group, GroupInfo, GroupName, Person, PersonalInfo as Info} from "./essets/entity";
import { PersonalName as Name, Persons, Phone } from "./essets/entity";
import { $Collection, $ivy, $JSONReader, $JSONWriter,  $Object, $Property, $TextWriter, $Writer} from "./lib/ivy";

const essets = $ivy<EssetsApp>(EssetsApp);

let json = fs.readFileSync(__dirname + "/private/appdata.json", "utf8");

essets.fromJSON(json);
let writer: any;
writer = new $TextWriter();
const result = writer.write(essets, 0);
console.log("\nHuman-readable:\n" + result);

json = essets.toJSON();
console.log("Original JSON:\n" + json);

const newEssets = $ivy<EssetsApp>(EssetsApp);
newEssets.fromJSON(json);
console.log("\nRe-loaded JSON:\n" + json);
