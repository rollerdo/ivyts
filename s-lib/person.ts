import { $App, $Boolean, $Collection, $Component, $Date, $Number, $Persistent, $String } from "./ivy";
import { $TypedCollection } from "./ivy";
import { age } from "./utils";

export class PersonalName extends $Component {

    constructor(owner?) {
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
    constructor(owner?) {
        super(owner);
        this.birthday.on("changed", () => {
            this.age.fire("evaluate");
        });
        this.age.on("evaluate", () => {
            this.age.value = age(new Date(Date.now()), this.birthday.value);
        });
        this.gender.options = {f: "female", m: "male"};
    }
    public birthday = new $Date(this);
    public age = new $Number(this);
    public gender = new $String(this);

    get displayValue(): any {
        return "Age: " + this.age.value;
    }
}

export abstract class Contact extends $Persistent {
    constructor(owner) {
        super(owner);
    }

    public preferred = new $Boolean(this);
}

export class Email extends Contact {
    constructor(owner?) {
        super(owner);
    }

    public address = new $String(this);

    get displayValue(): any {
        return this.address.value + (this.preferred.value ? " (preferred)" : "");
    }
}

export class Phone extends Contact {
    public constructor(owner?) {
        super(owner);
        this.phoneType.options = {h: "home", w: "work", m: "mobile", f: "fax"};
    }

    public number = new $String(this);
    public phoneType = new $String(this);

    get displayValue(): any {
        return this.number.value + (this.preferred.value ? " (preferred)" : "");
    }
}

export class Fax extends Contact {
    constructor(owner?) {
        super(owner);
    }

    public phoneNumber = new $String(this);
    public phoneType = new $String(this);

    get displayValue(): any {
        return this.phoneNumber.value + (this.preferred.value ? " (preferred)" : "");
    }
}

const contactInfoClasses = {
    Email: {
        className: "Email",
        factory: function(owner) {return $App.create<Email>(Email, owner); }
    },
    Phone: {
        className: "Phone",
        factory: function(owner) {return $App.create<Phone>(Phone, owner); }
    }
};

export class Contacts extends $TypedCollection<Contact> {
}

export class Person extends $Persistent {

    constructor(owner?) {
        super(owner);
        this.on("created", (event) => {
            this.contacts.factories = contactInfoClasses;
        });
    }

    public name = $App.create<PersonalName>(PersonalName, this);
    public personalInfo = $App.create<PersonalInfo>(PersonalInfo, this);
    public contacts = $App.create<Contacts>(Contacts, this);

    get displayValue(): any {
        return this.name.displayValue + ", " + this.personalInfo.displayValue;
    }
}
