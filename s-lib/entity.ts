import { $App, $Boolean, $Collection, $Complex, $Component, $Date, $Number, $Persistent, $String } from "./ivy";
import { $TypedCollection } from "./ivy";
import { age } from "./utils";

abstract class Name extends $Component {

}

export class PersonalName extends Name {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public first = new $String(this);
    public middle = new $String(this);
    public last = new $String(this);

    get displayValue(): any {
        return this.first.value + " " + this.middle.value + " " + this.last.value;
    }
}

export class GroupName extends Name {
    constructor(owner?: $Complex) {
        super(owner);
    }
    public primaryName = new $String(this);
    public secondaryName = new $String(this);
    get displayValue(): any {
        return this.primaryName.value + this.secondaryName.value ? (" " + this.secondaryName.value) : "";
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
    public birthday = new $Date(this);
    public age = new $Number(this);
    public gender = new $String(this);

    get displayValue(): any {
        return this.gender.options[this.gender.value] + ", Age " + this.age.value;
    }
}

export class GroupInfo extends Info {
    constructor(owner?: $Complex) {
        super(owner);
        this.groupType.options = { team: "Team", company: "Company", vendor: "Vendor" };
    }
    public groupType = new $String(this);

    get displayValue(): any {
        return this.groupType.options[this.groupType.value];
    }
}

export class BasicInfo extends $Component {

}

export class PersonBasicInfo extends BasicInfo {

    constructor(owner?) {
        super(owner);
    }

    get displayValue(): any {
        return this.name.displayValue + ", " + this.personalInfo.displayValue;
    }
    public name = $App.create<PersonalName>(PersonalName, this);
    public personalInfo = $App.create<PersonalInfo>(PersonalInfo, this);
}

export class GroupBasicInfo extends BasicInfo {
    constructor(owner?) {
        super(owner);
    }

    get displayValue(): any {
        return this.name.displayValue + ", " + this.groupInfo.displayValue;
    }

    public name = $App.create<GroupName>(GroupName, this);
    public groupInfo = $App.create<GroupInfo>(GroupInfo, this);
}

export abstract class Contact extends $Persistent {
    constructor(owner?: $Complex) {
        super(owner);
        this.contactType.caption = "Type";
    }

    public preferred = new $Boolean(this);
    public contactType = new $String(this);
}

export class Email extends Contact {
    constructor(owner?: $Complex) {
        super(owner);
        this.contactType.options = { p: "Personal", w: "Work" };
    }

    public address = new $String(this);

    get displayValue(): any {
        return this.address.value + (this.preferred.value ? " (Preferred)" : "") + " (" +
            this.contactType.options[this.contactType.value] + ")";
    }
}

export class Phone extends Contact {
    public constructor(owner?: $Complex) {
        super(owner);
        this.contactType.options = { h: "Home", w: "Work", m: "Mobile", f: "Fax" };
    }

    public number = new $String(this);

    get displayValue(): any {
        return this.number.value + ((this.preferred.value ? " (Preferred)" : "")) + " (" +
            this.contactType.options[this.contactType.value] + ")";
    }
}

export class Address extends Contact {

    constructor(owner?: $Complex) {
        super(owner);
        this.contactType.options = { p: "Primary", s: "Secondary" };
    }

    get displayValue(): any {
        return this.city.value + ", " + this.state.value + "  " + this.zip.value + " " +
            ((this.preferred.value ? " (Preferred)" : "")) + " (" +
            this.contactType.options[this.contactType.value] + ")";
    }
    public street1 = new $String(this);
    public street2 = new $String(this);
    public city = new $String(this);
    public state = new $String(this);
    public zip = new $String(this);
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
        factory: function (owner) { return $App.create<Email>(Email, owner); }
    }
};

const phoneClasses = {
    Phone: {
        className: "Phone",
        factory: function (owner) { return $App.create<Phone>(Phone, owner); }
    }
};

const addressClasses = {
    Address: {
        className: "Address",
        factory: function (owner) { return $App.create<Address>(Address, owner); }
    }
};

const memberClasses = {
    Member: {
        className: "Members",
        factory: function (owner) { return $App.create<Address>(Address, owner); }
    }
};

export abstract class Entity extends $Persistent {

    protected abstract createBasicInfo(): void;

    protected createCollections(): void {
        this.addresses = $App.create<Addresses>(Addresses, this);
        this.phones = $App.create<Phones>(Phones, this);
        this.emails = $App.create<Emails>(Emails, this);
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
        this.basicInfo = $App.create<PersonBasicInfo>(PersonBasicInfo, this);
    }

    get displayValue(): any {
        return this.basicInfo.name.displayValue;
    }
}

export class Group extends Entity {

    constructor(owner?: $Complex) {
        super(owner);
    }

    // Redeclare as subtype
    public basicInfo: GroupBasicInfo;

    protected createBasicInfo(): void {
        this.basicInfo = $App.create<GroupBasicInfo>(GroupBasicInfo, this);
    }

    get displayValue(): any {
        return this.basicInfo.name.displayValue;
    }
}
