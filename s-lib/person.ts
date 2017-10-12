import { $Boolean, $Collection, $Component, $Date, $Number, $Persistent, $String } from "./ivy";
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
    }
    public birthday = new $Date(this);
    public age = new $Number(this);

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
    constructor(owner?) {
        super(owner);
    }

    public phoneNumber = new $String(this);
    public phoneType = new $String(this);

    get displayValue(): any {
        return this.phoneNumber.value + (this.preferred.value ? " (preferred)" : "");
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
        factory: function(owner) {return new Email(owner).init(); }
    },
    Fax: {
        className: "Fax",
        factory: function(owner) {return new Fax(owner).init(); }
    },
    Phone: {
        className: "Phone",
        factory: function(owner) {return new Phone(owner).init(); }
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

    public name = new PersonalName(this).init();
    public personalInfo = new PersonalInfo(this).init();
    public contacts = new Contacts().init();

    get displayValue(): any {
        return this.name.displayValue + ", " + this.personalInfo.displayValue;
    }
}
