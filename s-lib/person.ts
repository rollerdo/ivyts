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
        this.gender.options = { f: "Female", m: "Male" };
    }
    public birthday = new $Date(this);
    public age = new $Number(this);
    public gender = new $String(this);

    get displayValue(): any {
        return this.gender.options[this.gender.value] + ", Age " + this.age.value;
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

export class Emails extends $TypedCollection<Email> {
}

export class Phones extends $TypedCollection<Phone> {
}

export class Address extends Contact {

    constructor(owner?: $Complex) {
        super(owner);
        this.contactType.options = { pri: "Primary", sec: "Secondary", ses: "Seasonal" };
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

export class Addresses extends $TypedCollection<Address> {
}

const addressClasses = {
    Address: {
        className: "Address",
        factory: function (owner) { return $App.create<Address>(Address, owner); }
    }
};

export class Person extends $Persistent {

    constructor(owner?: $Complex) {
        super(owner);
        this.on("created", (event) => {
            this.addresses.factories = addressClasses;
            this.phones.factories = phoneClasses;
            this.email.factories = emailClasses;
        });
    }

    public basicInfo = $App.create<BasicInfo>(BasicInfo, this);
    public addresses = $App.create<Addresses>(Addresses, this);
    public phones = $App.create<Phones>(Phones, this);
    public email = $App.create<Emails>(Emails, this);

    get displayValue(): any {
        return this.basicInfo.name.displayValue;
    }
}
