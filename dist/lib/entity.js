"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ivy_1 = require("./ivy");
const ivy_2 = require("./ivy");
const utils_1 = require("./utils");
class Name extends ivy_1.$Component {
}
class PersonalName extends Name {
    constructor(owner) {
        super(owner);
        this.first = new ivy_1.$String(this);
        this.middle = new ivy_1.$String(this);
        this.last = new ivy_1.$String(this);
    }
    get displayValue() {
        return this.first.value + " " + this.middle.value + " " + this.last.value;
    }
}
exports.PersonalName = PersonalName;
class GroupName extends Name {
    constructor(owner) {
        super(owner);
        this.primaryName = new ivy_1.$String(this);
        this.secondaryName = new ivy_1.$String(this);
    }
    get displayValue() {
        return this.primaryName.value + this.secondaryName.value ? (" " + this.secondaryName.value) : "";
    }
}
exports.GroupName = GroupName;
class Info extends ivy_1.$Component {
}
class PersonalInfo extends Info {
    constructor(owner) {
        super(owner);
        this.birthday = new ivy_1.$Date(this);
        this.age = new ivy_1.$Number(this);
        this.gender = new ivy_1.$String(this);
        this.birthday.on("changed", () => {
            this.age.fire("evaluate");
        });
        this.age.on("evaluate", () => {
            this.age.value = utils_1.age(new Date(Date.now()), this.birthday.value);
        });
        this.gender.options = { f: "Female", m: "Male" };
    }
    get displayValue() {
        return this.gender.options[this.gender.value] + ", Age " + this.age.value;
    }
}
exports.PersonalInfo = PersonalInfo;
class GroupInfo extends Info {
    constructor(owner) {
        super(owner);
        this.groupType = new ivy_1.$String(this);
        this.groupType.options = { team: "Team", company: "Company", vendor: "Vendor" };
    }
    get displayValue() {
        return this.groupType.options[this.groupType.value];
    }
}
exports.GroupInfo = GroupInfo;
class BasicInfo extends ivy_2.$Section {
}
exports.BasicInfo = BasicInfo;
class PersonBasicInfo extends BasicInfo {
    constructor(owner) {
        super(owner);
        this.name = ivy_1.$App.create(PersonalName, this);
        this.personalInfo = ivy_1.$App.create(PersonalInfo, this);
    }
    get displayValue() {
        return this.name.displayValue + ", " + this.personalInfo.displayValue;
    }
}
exports.PersonBasicInfo = PersonBasicInfo;
class GroupBasicInfo extends BasicInfo {
    constructor(owner) {
        super(owner);
        this.name = ivy_1.$App.create(GroupName, this);
        this.groupInfo = ivy_1.$App.create(GroupInfo, this);
    }
    get displayValue() {
        return this.name.displayValue + ", " + this.groupInfo.displayValue;
    }
}
exports.GroupBasicInfo = GroupBasicInfo;
class Contact extends ivy_1.$Persistent {
    constructor(owner) {
        super(owner);
        this.preferred = new ivy_1.$Boolean(this);
        this.contactType = new ivy_1.$String(this);
        this.contactType.caption = "Type";
    }
    pref() {
        return " <i class='fg-green " + (this.preferred.value ? "fas " : "far ") + this.icon + " fa-fw fa-sm'></i> ";
    }
}
exports.Contact = Contact;
class Email extends Contact {
    constructor(owner) {
        super(owner);
        this.address = new ivy_1.$String(this);
        this.contactType.options = { p: "Personal", w: "Work" };
    }
    get icon() {
        return "fa-envelope";
    }
    get displayValue() {
        return this.pref() + this.address.value +
            " (" + this.contactType.options[this.contactType.value] + ")";
    }
}
exports.Email = Email;
class Phone extends Contact {
    constructor(owner) {
        super(owner);
        this.number = new ivy_1.$String(this);
        this.contactType.options = { h: "Home", w: "Work", m: "Mobile", f: "Fax" };
    }
    get icon() {
        return "fa-phone";
    }
    get displayValue() {
        return this.pref() + this.number.value + " (" +
            this.contactType.options[this.contactType.value] + ")";
    }
}
exports.Phone = Phone;
class Address extends Contact {
    constructor(owner) {
        super(owner);
        this.street1 = new ivy_1.$String(this);
        this.street2 = new ivy_1.$String(this);
        this.city = new ivy_1.$String(this);
        this.state = new ivy_1.$String(this);
        this.zip = new ivy_1.$String(this);
        this.contactType.options = { p: "Primary", s: "Secondary" };
    }
    get icon() {
        return "fa-map-marker";
    }
    get displayValue() {
        return this.pref() + this.city.value + ", " + this.state.value + "  " + this.zip.value + " " + " (" +
            this.contactType.options[this.contactType.value] + ")";
    }
}
exports.Address = Address;
class ContactCollection extends ivy_2.$TypedCollection {
    constructor(owner) {
        super(owner);
        this.on("itemAdded", (event) => {
            // Allow only one preferred contact
            if (event.target.preferred.value) {
                if (!this._preferredContact) {
                    this._preferredContact = event.target;
                }
                else {
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
                }
                else {
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
    get preferredContact() {
        return this._preferredContact;
    }
    get displayValue() {
        const disp = this._preferredContact ? this._preferredContact :
            this.count ? this.toArray()[0] : undefined;
        return disp ? disp.displayValue : super.displayValue;
    }
}
exports.ContactCollection = ContactCollection;
class Emails extends ContactCollection {
}
exports.Emails = Emails;
class Phones extends ContactCollection {
}
exports.Phones = Phones;
class Addresses extends ContactCollection {
}
exports.Addresses = Addresses;
const emailClasses = {
    Email: {
        className: "Email",
        factory: function (owner) { return ivy_1.$App.create(Email, owner); }
    }
};
const phoneClasses = {
    Phone: {
        className: "Phone",
        factory: function (owner) { return ivy_1.$App.create(Phone, owner); }
    }
};
const addressClasses = {
    Address: {
        className: "Address",
        factory: function (owner) { return ivy_1.$App.create(Address, owner); }
    }
};
const memberClasses = {
    Member: {
        className: "Members",
        factory: function (owner) { return ivy_1.$App.create(Address, owner); }
    }
};
class Entity extends ivy_1.$Persistent {
    createCollections() {
        this.addresses = ivy_1.$App.create(Addresses, this);
        this.phones = ivy_1.$App.create(Phones, this);
        this.emails = ivy_1.$App.create(Emails, this);
    }
    constructor(owner) {
        super(owner);
        this.createBasicInfo();
        this.createCollections();
        this.on("created", (event) => {
            this.addresses.factories = addressClasses;
            this.phones.factories = phoneClasses;
            this.emails.factories = emailClasses;
        });
    }
}
exports.Entity = Entity;
class Person extends Entity {
    constructor(owner) {
        super(owner);
    }
    createBasicInfo() {
        this.basicInfo = ivy_1.$App.create(PersonBasicInfo, this);
    }
    get displayValue() {
        return this.basicInfo.name.displayValue;
    }
}
exports.Person = Person;
class Group extends Entity {
    constructor(owner) {
        super(owner);
    }
    createBasicInfo() {
        this.basicInfo = ivy_1.$App.create(GroupBasicInfo, this);
    }
    get displayValue() {
        return this.basicInfo.name.displayValue;
    }
}
exports.Group = Group;
//# sourceMappingURL=entity.js.map