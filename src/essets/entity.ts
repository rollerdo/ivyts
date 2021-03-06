import { $Boolean, $Collection, $Complex, $Component, $Date, $Number, $Persistent, $String } from "../lib/ivy";
import { $ivy, $Section, $TypedCollection } from "../lib/ivy";
import { age } from "../lib/utils";

abstract class Name extends $Component {

}

export class PersonalName extends Name {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public first = $ivy<$String>($String, this);
    public middle = $ivy<$String>($String, this);
    public last = $ivy<$String>($String, this);

    get displayValue(): any {
        return this.last.value + ", " + this.first.value + (this.middle.value ? (" " + this.middle.value) : "");
    }
}

export class GroupName extends Name {
    constructor(owner?: $Complex) {
        super(owner);
    }
    public primary = $ivy<$String>($String, this);
    public secondary = $ivy<$String>($String, this);
    get displayValue(): any {
        return this.primary.value + (this.secondary.value ? (" " + this.secondary.value) : "");
    }
}

abstract class Info extends $Component {

}

export class PersonalInfo extends Info {
    constructor(owner?: $Complex) {
        super(owner);
        this.birthday.on("changed", () => {
            this.age.fire("evaluate");
        });
        this.age.on("evaluate", () => {
            this.age.value = age(new Date(Date.now()), this.birthday.value);
        });
        this.gender.options = { f: "Female", m: "Male" };
    }
    public birthday = $ivy<$Date>($Date, this);
    public age = $ivy<$Number>($Number, this);
    public gender = $ivy<$String>($String, this);

    get displayValue(): any {
        return this.gender.options[this.gender.value] + ", Age " + this.age.value;
    }
}

export class GroupInfo extends Info {
    constructor(owner?: $Complex) {
        super(owner);
        this.groupType.options = { team: "Team", division: "Division", company: "Company", vendor: "Vendor" };
    }
    public groupType = $ivy<$String>($String, this);

    get displayValue(): any {
        return this.groupType.options[this.groupType.value];
    }
}

export class BasicInfo extends $Section {

}

export class PersonBasicInfo extends BasicInfo {

    constructor(owner?) {
        super(owner);
    }

    get displayValue(): any {
        return this.name.displayValue + ", " + this.personalInfo.displayValue;
    }
    public name = $ivy<PersonalName>(PersonalName, this);
    public personalInfo = $ivy<PersonalInfo>(PersonalInfo, this);
}

export class GroupBasicInfo extends BasicInfo {
    constructor(owner?) {
        super(owner);
    }

    get displayValue(): any {
        return this.name.displayValue + ", " + this.groupInfo.displayValue;
    }

    public name = $ivy<GroupName>(GroupName, this);
    public groupInfo = $ivy<GroupInfo>(GroupInfo, this);
}

export abstract class Contact extends $Persistent {
    constructor(owner?: $Complex) {
        super(owner);
        this.contactType.caption = "Type";
    }

    protected pref() {
        return " <i class='fg-green " + (this.preferred.value ? "fas " : "far ")  +  this.icon + " fa-fw fa-sm'></i> ";
    }

    protected desc() {
        return " (" + (this.description.value ?
            this.description.value : (this.contactType.options[this.contactType.value])) + ")";
    }

    public preferred = $ivy<$Boolean>($Boolean, this);
    public contactType = $ivy<$String>($String, this);
    public description = $ivy<$String>($String, this);
}

export class Email extends Contact {
    constructor(owner?: $Complex) {
        super(owner);
        this.contactType.options = { p: "Personal", w: "Work" };
    }

    public get icon(): string {
        return "fa-envelope";
    }

    public address = $ivy<$String>($String, this);

    get displayValue(): any {
        return this.address.value + this.desc();
    }
}

export class Phone extends Contact {
    public constructor(owner?: $Complex) {
        super(owner);
        this.contactType.options = { h: "Home", w: "Work", m: "Mobile", f: "Fax" };
    }

    public get icon(): string {
        return "fa-phone";
    }

    public number = $ivy<$String>($String, this);

    get displayValue(): any {
        return this.number.value + " (" +
            (this.description.value ? this.description.value : this.contactType.options[this.contactType.value]) + ")";
    }
}

export class Address extends Contact {

    constructor(owner?: $Complex) {
        super(owner);
        this.contactType.options = { p: "Primary", s: "Secondary" };
    }

    public get icon(): string {
        return "fa-map-marker";
    }

    get displayValue(): any {
        return this.city.value + ", " + this.state.value + "  " + this.zip.value + " " + " (" +
            this.contactType.options[this.contactType.value] + ")";
    }
    public street1 = $ivy<$String>($String, this);
    public street2 = $ivy<$String>($String, this);
    public city = $ivy<$String>($String, this);
    public state = $ivy<$String>($String, this);
    public zip = $ivy<$String>($String, this);
}

export class ContactCollection extends $TypedCollection<Contact> {
    private _preferredContact: Contact;
    public constructor(owner: $Complex) {
        super(owner);
        this.on("itemAdded", (event) => {
            // Allow only one preferred contact
            if (event.target.preferred.value) {
                if (!this._preferredContact) {
                    this._preferredContact = event.target;
                } else {
                    event.target.preferred.value = false;
                }
            }
            this.refreshViews();
        });
        this.on("propertyChanged", (event) => {
            // Did the preferred property change?
            if (event.target.className === "preferred") {
                // If it's changed to true, set the old last preferred contact value (_preferredContact) to false
                if (event.current === true) {
                    if (this._preferredContact) {
                        this._preferredContact.preferred.value = false;
                    }
                    // Set the _preferredContact to the new Object
                    this._preferredContact = event.target.owner;
                } else {
                    // If the current _preferredContact is now false, we have no preferred contact
                    if (event.target.owner === this._preferredContact) {
                        this._preferredContact = undefined;
                    }
                }
                this.refreshViews();
            }
        });
    }

    // Expolse _preferred contact as readOnly just in case someone needs it...
    public get preferredContact() {
        return this._preferredContact;
    }

    public get displayValue(): string {
        const disp: Contact = this._preferredContact ? this._preferredContact :
            this.count ? this.toArray()[0] : undefined;
        return disp ? disp.displayValue : super.displayValue;
    }

}

export class Emails extends ContactCollection {
}

export class Phones extends ContactCollection {
}

export class Addresses extends ContactCollection {
}

const emailClasses = {
    Email: {
        className: "Email",
        factory: function (owner) { return $ivy<Email>(Email, owner); }
    }
};

const phoneClasses = {
    Phone: {
        className: "Phone",
        factory: function (owner) { return $ivy<Phone>(Phone, owner); }
    }
};

const addressClasses = {
    Address: {
        className: "Address",
        factory: function (owner) { return $ivy<Address>(Address, owner); }
    }
};

const memberClasses = {
    Member: {
        className: "Members",
        factory: function (owner) { return $ivy<Address>(Address, owner); }
    }
};

const personClasses = {
    Person: {
        className: "Persons",
        factory: function (owner) { return $ivy<Person>(Person, owner); }
    }
};

const groupClasses = {
    Group: {
        className: "Groups",
        factory: function (owner) { return $ivy<Group>(Group, owner); }
    }
};

export abstract class Entity extends $Persistent {

    protected abstract createBasicInfo(): void;

    protected createCollections(): void {
        this.addresses = $ivy<Addresses>(Addresses, this);
        this.phones = $ivy<Phones>(Phones, this);
        this.emails = $ivy<Emails>(Emails, this);
    }

    constructor(owner?: $Complex) {
        super(owner);
        this.createBasicInfo();
        this.createCollections();
        this.on("created", (event) => {
            this.addresses.factories = addressClasses;
            this.phones.factories = phoneClasses;
            this.emails.factories = emailClasses;
        });
    }
    public basicInfo: BasicInfo;
    public addresses: Addresses;
    public phones: Phones;
    public emails: Emails;

}

export class Person extends Entity {

    constructor(owner?: $Complex) {
        super(owner);
    }

    // Redeclare as subtype
    public basicInfo: PersonBasicInfo;

    protected createBasicInfo(): void {
        this.basicInfo = $ivy<PersonBasicInfo>(PersonBasicInfo, this);
    }

    get displayValue(): any {
        return this.basicInfo.name.displayValue;
    }
}

export class Persons extends $TypedCollection<Person> {
    constructor(owner?: $Complex) {
        super(owner);
        this.factories = personClasses;
    }
}

export class Group extends Entity {

    constructor(owner?: $Complex) {
        super(owner);
    }

    // Redeclare as subtype
    public basicInfo: GroupBasicInfo;

    protected createBasicInfo(): void {
        this.basicInfo = $ivy<GroupBasicInfo>(GroupBasicInfo, this);
    }

    get displayValue(): any {
        return this.basicInfo.name.displayValue;
    }
}

export class Groups extends $TypedCollection<Group> {
    constructor(owner?: $Complex) {
        super(owner);
        this.factories = groupClasses;
    }
}
