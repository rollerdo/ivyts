import { $App, $Boolean, $Collection, $Complex, $Component, $Date, $Number, $Persistent, $String } from "./ivy";
import { $TypedCollection } from "./ivy";
import { age } from "./utils";

export class PersonalName extends $Component {

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

export class PersonalInfo extends $Component {
    constructor(owner?: $Complex) {
        super(owner);
        this.birthday.on("changed", () => {
            this.age.fire("evaluate");
        });
        this.age.on("evaluate", () => {
            this.age.value = age(new Date(Date.now()), this.birthday.value);
        });
        this.gender.options = { f: "female", m: "male" };
    }
    public birthday = new $Date(this);
    public age = new $Number(this);
    public gender = new $String(this);

    get displayValue(): any {
        return this.gender.options[this.gender.value] + ", age " + this.age.value;
    }
}

export class BasicInfo extends $Component {

    constructor(owner?) {
        super(owner);
    }

    get displayValue(): any {
        return this.name.displayValue + ", " + this.personalInfo.displayValue;
    }
    public name = $App.create<PersonalName>(PersonalName, this);
    public personalInfo = $App.create<PersonalInfo>(PersonalInfo, this);
}

export abstract class Contact extends $Persistent {
    constructor(owner?: $Complex) {
        super(owner);
    }

    public preferred = new $Boolean(this);
    public contactType = new $String(this);
}

export class Email extends Contact {
    constructor(owner?: $Complex) {
        super(owner);
        this.contactType.options = { p: "personal", w: "work" };
    }

    public address = new $String(this);

    get displayValue(): any {
        return this.address.value + (this.preferred.value ? " (preferred)" : "") + " (" +
            this.contactType.options[this.contactType.value] + ")";
    }
}

export class Phone extends Contact {
    public constructor(owner?: $Complex) {
        super(owner);
        this.contactType.options = { h: "home", w: "work", m: "mobile", f: "fax" };
    }

    public number = new $String(this);

    get displayValue(): any {
        return this.number.value + ((this.preferred.value ? " (preferred)" : "")) + " (" +
            this.contactType.options[this.contactType.value] + ")";
    }
}

const contactInfoClasses = {
    Email: {
        className: "Email",
        factory: function (owner) { return $App.create<Email>(Email, owner); }
    },
    Phone: {
        className: "Phone",
        factory: function (owner) { return $App.create<Phone>(Phone, owner); }
    }
};

export class Contacts extends $TypedCollection<Contact> {
}

export class Address extends Contact {

    constructor(owner?: $Complex) {
        super(owner);
        this.contactType.options = { pri: "primary", sec: "secondary", ses: "seasonal" };
    }

    get displayValue(): any {
        return this.city.value + ", " + this.state.value + "  " + this.zip.value + " " +
        ((this.preferred.value ? " (preferred)" : "")) + " (" +
            this.contactType.options[this.contactType.value] + ")";
    }
    public street1 = new $String(this);
    public street2 = new $String(this);
    public city = new $String(this);
    public state = new $String(this);
    public zip = new $String(this);
}

export class Addresses extends $TypedCollection<Address> {
}

const addressClasses = {
    Email: {
        className: "Address",
        factory: function (owner) { return $App.create<Address>(Address, owner); }
    }
};

export class Person extends $Persistent {

    constructor(owner?: $Complex) {
        super(owner);
        this.on("created", (event) => {
            this.contactInfo.factories = contactInfoClasses;
            this.addresses.factories = addressClasses;
        });
    }

    public basicInfo = $App.create<BasicInfo>(BasicInfo, this);
    public contactInfo = $App.create<Contacts>(Contacts, this);
    public addresses = $App.create<Addresses>(Addresses, this);

    get displayValue(): any {
        return this.basicInfo.name.displayValue;
    }
}
