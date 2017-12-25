"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class IDFactory {
}
// Creates a globally-unique ID. Slowest but should be unique among all objects in the known universe.
class GUIDFactory extends IDFactory {
    createID() {
        const guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    }
}
// Creates a locally-unique ID. Faster than guidFactory but only guaranteed unique within the Ivy universe.
class LUIDFactory extends IDFactory {
    constructor() {
        super(...arguments);
        this._seed = 1;
    }
    createID() {
        const _n = Number(new Date()) + this._seed++;
        if (this._seed > 100000) {
            this._seed = 1;
        }
        return _n.toString(16);
    }
}
const idFactory = new LUIDFactory();
const keyFactory = new LUIDFactory();
class $Property {
    constructor(owner) {
        utils_1.enableEvents(this);
        this._key = keyFactory.createID();
        this._owner = owner;
    }
    // Stub for enableEvents()
    fire(event) {
        return this;
    }
    // Stub for enableEvents()
    on(type, method, parameters) {
        return this;
    }
    get caption() {
        if (!this._caption) {
            this._caption = utils_1.decamelCase(this.className).trim();
        }
        return this._caption;
    }
    set caption(v) {
        this._caption = v;
    }
    get className() {
        if (!this._clsName) {
            this._clsName = this.constructor.name;
        }
        return this._clsName;
    }
    set className(v) {
        this._clsName = v;
    }
    get displayValue() {
        return this.className;
    }
    get icon() {
        return undefined;
    }
    is(cls) {
        return this instanceof cls;
    }
    get key() {
        return this._key;
    }
    get owner() {
        return this._owner;
    }
    get root() {
        let _root;
        if (this.is($Complex)) {
            _root = this;
        }
        else {
            _root = this.owner;
        }
        while (_root) {
            if (_root.owner) {
                _root = _root.owner;
            }
        }
        return _root;
    }
    fromJSON(json) {
        const reader = new $JSONReader();
        const obj = JSON.parse(json);
        reader.read(this, obj);
    }
    toJSON() {
        const writer = new $JSONWriter();
        return writer.write(this);
    }
    get readOnly() {
        return false;
    }
    get views() {
        if (!this._views) {
            this._views = this.createViewCollection();
        }
        return this._views;
    }
    // Override createViewCollection to add a more sophisticated collection object.
    createViewCollection() {
        const _coll = $App.create(ViewCollection, this);
        // When we add the view, we need to set the view's model property
        _coll.on("itemAdded", (event) => {
            event.target.model = this;
        });
        // Set the removed model to undefined to be a good garbage collection citizen.
        _coll.on("itemRemoved", (event) => {
            event.target.model = undefined;
        });
        return _coll;
    }
    // Iterates through all of the current views and refreshes them.
    refreshViews() {
        // Get out fast if there are no views
        if (this._views) {
            if (this._views.count) {
                this._views.forEach((v) => {
                    v.refresh();
                });
            }
        }
    }
}
exports.$Property = $Property;
class $Complex extends $Property {
    constructor(owner) {
        super(owner);
    }
    toArray() {
        const ar = [];
        this.forEach((prop) => {
            ar.push(prop);
        });
        return ar;
    }
}
exports.$Complex = $Complex;
class $Collection extends $Complex {
    constructor(owner) {
        super(owner);
        this._count = 0;
        this._db = {};
        this.on("itemAdded", (event) => {
            event.target.on("propertyChanging", (ev) => {
                this.fire(ev);
            });
            event.target.on("propertyChanged", (ev) => {
                this.fire(ev);
            });
        });
        this.on("propertyChanged", () => {
            this.refreshViews();
        });
    }
    add(prop) {
        this._db[prop.key] = prop;
        this._count++;
        this.fire({ type: "itemAdded", target: prop });
    }
    contains(key) {
        return this._db[key] ? true : false;
    }
    get count() {
        return this._count;
    }
    createMember(className) {
        const cls = this.factories[className];
        return cls.factory(this);
    }
    get displayValue() {
        return "Count: " + this.count;
    }
    forEach(func) {
        let n;
        let i = 0;
        for (n in this._db) {
            func.call(this, this._db[n], i);
            i++;
        }
    }
    get factories() {
        return this._factories;
    }
    set factories(facs) {
        this._factories = facs;
    }
    remove(prop) {
        // Todo: We need to determine if delete causes garbage collection issues.
        delete (this._db[prop.key]);
        this._count--;
        this.fire({ type: "itemRemoved", target: prop });
    }
    find(key) {
        return this._db[key];
    }
    toArray() {
        const ar = [];
        this.forEach((prop) => {
            ar.push(prop);
        });
        return ar;
    }
}
exports.$Collection = $Collection;
class $TypedCollection extends $Collection {
    find(key) {
        return this._db[key];
    }
    toArray() {
        const ar = [];
        this.forEach((prop) => {
            ar.push(prop);
        });
        return ar;
    }
}
exports.$TypedCollection = $TypedCollection;
class ViewCollection extends $TypedCollection {
}
exports.ViewCollection = ViewCollection;
class $Object extends $Complex {
    constructor(owner) {
        super(owner);
        this._props = [];
        this._names = {};
        // Must be done after properties from all descendent classes have been added.
        this.on("created", (event) => {
            this.initProperties();
        });
        this.on("propertyChanged", function (event) {
            this.refreshViews();
            if (this.owner) {
                this.owner.fire({ type: "propertyChanged", target: this });
            }
        });
    }
    byName(n) {
        return this._names[n];
    }
    initProperties() {
        let _v, _n;
        for (_n in this) {
            _v = this[_n];
            if (_v instanceof $Property) {
                // The only way I've figured out not to include private or protected members
                // as properties is to identify them through their name. This means that they
                // must all begin with an underline ("_") character. Maybe we'll find a better
                // way...
                if (_n[0] !== "_") {
                    _v.className = _n;
                    this._props.push(_v);
                    this._names[_n] = _v;
                }
            }
        }
    }
    get count() {
        return this._props.length;
    }
    forEach(func) {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            func.call(this, this._props[i], i);
        }
    }
    toArray() {
        return this._props;
    }
}
exports.$Object = $Object;
// A stand-along document with its own unique ID
class $Persistent extends $Object {
    constructor(owner) {
        super(owner);
        this.ID = new $ID(this);
        this.ID.value = idFactory.createID();
        this.on("created", function (event) {
            this.ID.value = idFactory.createID();
            // Todo: Fix this at some point. initProperties() decamelCases the caption to "I D"
            this.ID.caption = "ID";
        });
    }
    get documentClass() {
        return "Persistent";
    }
}
exports.$Persistent = $Persistent;
// A larger group of logically related fields contained in a document. May be optional or mandatory
class $Section extends $Object {
    constructor(owner) {
        super(owner);
    }
    get documentClass() {
        return "Section";
    }
    // By default a section is mandatory
    get mandatory() {
        return true;
    }
}
exports.$Section = $Section;
// A small group of logically related mandatory fields (e.g. personal name) in a $Peristent object
class $Component extends $Object {
    get documentClass() {
        return "Component";
    }
}
exports.$Component = $Component;
class $Value extends $Property {
    constructor(owner) {
        super(owner);
        this._calculating = false;
        this._options = undefined;
    }
    get displayValue() {
        return this.value;
    }
    get value() {
        // Calculate if needed and go set to the current value
        if (!(typeof this._calculation === "undefined") && !(this._calculating)) {
            // Set the calc flag so we don't recurse on this
            this._calculating = true;
            this.value.set(this._calculation());
            // Clear the calc flag
            this._calculating = false;
        }
        else if (typeof this._val === "undefined" && this._initialValue) {
            // Do we need to do something with null values before returning? If so, set the value accordingly and return
            // the new value.
            // If no, has the nullVal parameter been passed with get()?
            // Has this.initialValue function been defined?
            this.value.set(this._initialValue());
        }
        return this._val;
    }
    set value(v) {
        let equal;
        let event;
        const pval = this.convert(v);
        // Dates cannot be directly compared
        if (pval instanceof (Date)) {
            if (this._val instanceof (Date)) {
                equal = (pval.getTime() === this._val.getTime());
            }
            else {
                equal = false;
            }
        }
        else {
            equal = (pval === this._val);
        }
        if (!equal) {
            // Fire the "changing" events. Any handler that sets _event.cancel to true will cancel the change.
            // Handlers should never set _event.cancel to false unless the want to override other handlers.
            if (this.owner) {
                this.owner.fire(event = {
                    type: "propertyChanging", target: this, current: this._val,
                    proposed: pval, cancel: false
                });
            }
            if (!event || !event.cancel) {
                this.fire(event = {
                    type: "changing", target: this, current: this._val, proposed: pval,
                    cancel: false
                });
            }
            // Make the change it the event wasn't canceled
            if (!event.cancel) {
                const _old = this._val;
                this._val = event.proposed;
                // Set the changed flag
                // todo: At some point, we will want to add a logChange method to create an undo trail
                // this.changed = true;
                // Fire the "changed" events to any interested listener
                this.fire({ type: "changed", target: this, previous: _old, current: this._val });
                // Notify the owner that we've changed.
                if (this.owner) {
                    this.owner.fire({ type: "propertyChanged", target: this, previous: _old, current: this._val });
                }
            }
            // Whether we accepted the proposed change or not, we might need to refresh a view that attempted
            // the change, such as an input element, which would now hold the proposed, but no longer valid, value.
            this.refreshViews();
        }
    }
    get options() {
        return this._options;
    }
    set options(val) {
        this._options = val;
    }
}
exports.$Value = $Value;
class $String extends $Value {
    constructor(owner) {
        super(owner);
    }
    convert(v) {
        return v.toString();
    }
    get dataType() {
        return "string";
    }
}
exports.$String = $String;
class $ID extends $String {
    get readOnly() {
        return true;
    }
}
exports.$ID = $ID;
class $Number extends $Value {
    constructor(owner) {
        super(owner);
    }
    convert(v) {
        return Number(v);
    }
    get dataType() {
        return "number";
    }
}
exports.$Number = $Number;
class $Date extends $Value {
    constructor(owner) {
        super(owner);
    }
    convert(v) {
        if (v && typeof v !== "object") {
            v = new Date(v);
        }
        return (v);
    }
    get dataType() {
        return "date";
    }
}
exports.$Date = $Date;
class $Boolean extends $Value {
    constructor(owner) {
        super(owner);
    }
    convert(v) {
        return Boolean(v);
    }
    get dataType() {
        return "boolean";
    }
}
exports.$Boolean = $Boolean;
class $Any extends $Value {
    constructor(owner) {
        super(owner);
    }
    convert(v) {
        return v;
    }
    get dataType() {
        return "any";
    }
}
exports.$Any = $Any;
const spaces = "                                                             ";
class $Writer {
    write(prop, params) {
        this.initialize(prop, params);
        this.writeProperties(prop, params);
        this.finalize(prop, params);
        return this._result;
    }
    initialize(prop, params) {
    }
    finalize(prop, params) {
    }
    writeProperties(prop, params) {
        if (prop.is($Collection)) {
            this.writeCollection(prop, params);
        }
        else if (prop.is($Object)) {
            this.writeObject(prop, params);
        }
        else if (prop.is($Value)) {
            this.writeValue(prop, params);
        }
    }
}
exports.$Writer = $Writer;
class $TextWriter extends $Writer {
    constructor(tab) {
        super();
        this._tab = 3;
        this._tab = tab ? tab : 3;
    }
    initialize(prop, params) {
        this._result = "";
    }
    finalize(prop, params) {
    }
    writeProperties(prop, level) {
        const indent = spaces.substr(0, this._tab * level);
        this._result += indent + prop.caption + ": ";
        super.writeProperties(prop, level);
    }
    writeCollection(prop, level) {
        this._result += prop.displayValue + "\n";
        prop.forEach((p) => {
            this.writeProperties(p, level + 1);
        });
    }
    writeObject(prop, level) {
        this._result += prop.displayValue + "\n";
        prop.forEach((p) => {
            this.writeProperties(p, level + 1);
        });
    }
    writeValue(prop, level) {
        this._result += prop.value + "\n";
    }
}
exports.$TextWriter = $TextWriter;
class $JSONWriter extends $Writer {
    initialize(prop, params) {
        this._result = "";
    }
    finalize(prop, params) {
        this._result = "{" + this._result + "}";
    }
    writeProperties(prop) {
        this._result += '"' + prop.className + '": ';
        super.writeProperties(prop);
    }
    writeCollection(prop) {
        this._result += "[";
        prop.forEach((p, i) => {
            if (i) {
                this._result += ",";
            }
            this._result += "{";
            this.writeProperties(p);
            this._result += "}";
        });
        this._result += "]";
    }
    writeObject(prop) {
        this._result += "{";
        prop.forEach((p, i) => {
            if (i) {
                this._result += ",";
            }
            this.writeProperties(p);
        });
        this._result += "}";
    }
    writeValue(prop) {
        if ((prop.is($String) || prop.is($Date))) {
            this._result += '"' + (prop.value) + '"';
        }
        else {
            this._result += prop.value;
        }
    }
}
exports.$JSONWriter = $JSONWriter;
class $JSONReader {
    read(inst, source) {
        let name;
        for (name in source) {
            this.readProperties(inst, source[name]);
        }
    }
    readProperties(parentInst, parentSource) {
        let n1;
        let childInst;
        let childSource;
        for (n1 in parentSource) {
            childSource = parentSource[n1];
            childInst = parentInst[n1];
            if (childInst.is($Value)) {
                // Simply assign the childSource value to the childInst, and we're finished
                childInst.value = childSource;
            }
            else if (childInst.is($Object)) {
                // Recursively read the child object's properties
                this.readProperties(childInst, childSource);
            }
            else if (childInst.is($Collection)) {
                const collInst = childInst;
                let n2;
                let memberInst;
                // Iterate through the source array for the array members
                childSource.forEach((memberSource) => {
                    // Get the name of the member property. There will be only one iteration in this for-in loop.
                    for (n2 in memberSource) {
                        // We use the name memberSource object (n2) to create the memberInst object
                        memberInst = collInst.createMember(n2);
                        // Add it to the collection
                        collInst.add(memberInst);
                        // Recursively read the collection member's properties;
                        this.readProperties(memberInst, memberSource[n2]);
                    }
                });
            }
            else {
                throw Error("Invalid Object " + childSource);
            }
        }
    }
}
exports.$JSONReader = $JSONReader;
class $App extends $Persistent {
    static create(c, owner) {
        const obj = new c(owner);
        obj.fire("created");
        return obj;
    }
    constructor(owner) {
        super(owner);
    }
}
exports.$App = $App;
exports.app = new $App();
//# sourceMappingURL=ivy.js.map