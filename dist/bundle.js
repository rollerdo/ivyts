/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(1);
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
            // The if statement below only happens when the root object is a collection
            // Unlike an object, a collection doesn't construct empty objects that will be
            // filled upon reading. Instead it must construct each child object.
            if (!childInst) {
                childInst = parentInst;
                childSource = parentSource;
            }
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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function decamelCase(s) {
    return s.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
        return str.toUpperCase();
    });
}
exports.decamelCase = decamelCase;
// Computes the age of this date in years.
function age(dateNow, dateThen) {
    if (!dateThen) {
        return undefined;
    }
    let _age = dateNow.getFullYear() - dateThen.getFullYear();
    const m = dateNow.getMonth() - dateThen.getMonth();
    if (m < 0 || (m === 0 && dateNow.getDate() < dateThen.getDate())) {
        _age--;
    }
    return _age;
}
exports.age = age;
function foreachProp(that, props, func) {
    let _name;
    for (_name in props) {
        if (props.hasOwnProperty(_name)) {
            func.call(that, props[_name], _name);
        }
    }
}
exports.foreachProp = foreachProp;
exports.enableEvents = function (that) {
    const registry = {};
    that.fire = function (event) {
        let array, func, handler, i;
        const type = typeof event === "string" ? event : event.type;
        if (registry.hasOwnProperty(type)) {
            array = registry[type];
            for (i = 0; i < array.length; i += 1) {
                handler = array[i];
                func = handler.method;
                if (typeof func === "string") {
                    func = this[func];
                }
                func.apply(this, handler.parameters || [event]);
            }
        }
        return this;
    };
    that.on = function (type, method, parameters) {
        const handler = { method: method, parameters: parameters };
        if (registry.hasOwnProperty(type)) {
            registry[type].push(handler);
        }
        else {
            registry[type] = [handler];
        }
        return this;
    };
    return that;
};
function padLeft(str, paddingValue) {
    return String(paddingValue + str).slice(-paddingValue.length);
}
exports.padLeft = padLeft;
// Converts a date to a string that can be used by the Javascript date control
function toInputStringfromDate(val) {
    const retVal = padLeft(val.getFullYear().toString(), "0000") + "-" +
        padLeft((val.getMonth() + 1).toString(), "00") + "-" +
        padLeft(val.getDate().toString(), "00");
    return retVal;
}
exports.toInputStringfromDate = toInputStringfromDate;
function toDateFromInputString(val) {
    const y = Number(val.substr(0, 4));
    const m = Number(val.substr(5, 2)) - 1;
    const d = Number(val.substr(8, 2));
    return new Date(y, m, d);
}
exports.toDateFromInputString = toDateFromInputString;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const entity_1 = __webpack_require__(5);
const ivy_1 = __webpack_require__(0);
const views_1 = __webpack_require__(4);
function main() {
    loadDoc();
}
function loadDoc() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            createPerson(this.responseText);
        }
    };
    xhttp.open("GET", "http://localhost:8080/persons", true);
    xhttp.send();
}
function createPerson(json) {
    const frame = document.getElementById("frame");
    const objView = ivy_1.$App.create(views_1.AccordionObjectView);
    const persons = ivy_1.$App.create(entity_1.Persons);
    persons.fromJSON(json);
    const person = persons.toArray()[1];
    person.views.add(objView);
    objView.insert(frame);
}
main();


/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ivy_1 = __webpack_require__(0);
const ivy_2 = __webpack_require__(0);
const utils_1 = __webpack_require__(1);
class HtElement extends ivy_2.$Object {
    constructor(owner) {
        super(owner);
        this._hidden = false;
    }
    // Encapsulates the document model's appendChild
    appendChild(inst) {
        // Since pro.elem is a protected variable, we don't have direct access to it via inst. We can,
        // however, fire an accessRequest event, passing the name of the member of the protected variable
        // (in this case "elem") which is returned in event.value.
        this.elem.appendChild(inst.elem);
    }
    get elem() {
        if (!this._elem) {
            this._elem = this.createElement();
        }
        return this._elem;
    }
    get classList() {
        return this.elem.classList;
    }
    focus() {
        this.elem.focus();
    }
    // Insert passes the document element into which we want to insert our view. This is NOT an ivy object
    // but a normal HTML document element, so we pass it the pointer to our document element.
    insert(parentElem, refresh) {
        parentElem.appendChild(this.elem);
    }
    get hideable() {
        return (this.elem.childNodes.length > 0);
    }
    get hidden() {
        return this._hidden;
    }
    set hidden(val) {
        if (val && (!this._hidden)) {
            this._oldDisplay = this.elem.style.display;
            this.elem.style.display = "none";
            this._hidden = val;
        }
        else if ((!val) && this._hidden) {
            this._hidden = val;
            this.elem.style.display = this._oldDisplay;
        }
    }
    // Retrieve an attribute from the document element by its name
    getAttribute(attribName) {
        return this.elem.getAttribute(attribName);
    }
    // Set an attribute on the document element by its name. val contains the value to set on the attribute
    setAttribute(attribName, val) {
        this.elem.setAttribute(attribName, val);
    }
    // Get the current event handler for a specific event (passed as a string in eventName)
    getEventHandler(eventName) {
        return this.elem[eventName];
    }
    set onclick(func) {
        this.elem.onclick = func;
    }
    // Get the current event handler for a specific event (passed as a string in eventName)
    setEventHandler(eventName, handler) {
        this.elem[eventName] = handler;
    }
    get style() {
        return this.elem.style;
    }
}
exports.HtElement = HtElement;
// An unanadorned div, the simplest particle in our atomic model
class Div extends HtElement {
    constructor(owner) {
        super(owner);
    }
    createElement() {
        return document.createElement("div");
    }
}
exports.Div = Div;
// Any view which manages a simple value data type (string, number, bool, date/time) exposes get/set methods, which
// manage access to the value associated with the element. For most document elements, this is simply the text value
// of the innerHTML property. (See the ivc.input type below, which overrides get/set, which in its case, is an attribute
// on the input document element
class ValueElement extends HtElement {
    constructor(owner) {
        super(owner);
    }
    set value(val) {
        const _elem = this.elem;
        // Don't waste our time we've already set this value. We don't want to re-display what is already displayed.
        if (_elem.innerHTML !== val) {
            _elem.innerHTML = val;
        }
    }
    get value() {
        return this.elem.innerHTML;
    }
}
exports.ValueElement = ValueElement;
class Label extends ValueElement {
    constructor(owner) {
        super(owner);
    }
    createElement() {
        return document.createElement("label");
    }
}
exports.Label = Label;
// A div class which functions as a text label, not as an outside wrapper for other document elements. It can be
// substitued for the label class above.
class DivLabel extends ValueElement {
    constructor(owner) {
        super(owner);
    }
    createElement() {
        return document.createElement("div");
    }
}
exports.DivLabel = DivLabel;
class Icon extends ValueElement {
    constructor(owner) {
        super(owner);
    }
    createElement() {
        return document.createElement("i");
    }
}
exports.Icon = Icon;
class Button extends ValueElement {
    constructor(owner) {
        super(owner);
    }
    get value() {
        return this.elem.value;
    }
    set value(val) {
        const _current = this.value;
        if (_current !== val) {
            this.elem.value = val;
        }
    }
    createElement() {
        const _elem = document.createElement("input");
        _elem.type = "button";
        _elem.onclick = () => {
            this.fire({ type: "clicked", target: this });
        };
        return _elem;
    }
}
exports.Button = Button;
class Select extends ValueElement {
    constructor(owner) {
        super(owner);
        this.on("created", () => {
            //            this.initializeOptions({ usa: "USA", cr: "Costa Rica" });
            //            this.initializeOptions(["USA", "Costa Rica" ]);
            this.initializeOptions([{ value: "usa", display: "USA" }, { value: "cr", display: "Costa Rica" }]);
            this._entryVal = this.value;
        });
    }
    createElement() {
        const _elem = document.createElement("select");
        // Captures the onchange event from the input element and fires it in the context of this instance.
        _elem.onchange = () => {
            // Set the value of the select object from its encapsulated select element
            // _that.set();
            // Now fire the changed event. To the listener, it will look just like an input element
            this.fire({ type: "changed", target: this, previous: this._entryVal, current: this.value });
            // Save the new value to pass as previous in case they change again before leaving the field
            this._entryVal = this.value;
        };
        _elem.onfocus = () => {
            this._entryVal = this.value;
        };
        return _elem;
    }
    addOption(txt, val) {
        // Create the option element
        const _option = document.createElement("option");
        // Set the displayed option value
        _option.text = txt;
        // We can't store the value in the option.value attribute, since it's always written as a string.
        // tslint:disable-next-line:no-string-literal
        _option["val"] = val;
        this.elem.options.add(_option);
    }
    // Builds an option list from the this.options function.
    initializeOptions(opts) {
        this.clearOptions();
        if (!Array.isArray(opts)) {
            utils_1.foreachProp(this, opts, function (opt, name) { this.addOption(opt, name); });
        }
        else {
            opts.forEach((opt) => {
                if (typeof opt === "string") {
                    this.addOption(opt, opt);
                }
                else {
                    this.addOption(opt.display, opt.value);
                }
            });
        }
    }
    get selectedIndex() {
        return this.elem.selectedIndex;
    }
    set selectedIndex(index) {
        this.elem.selectedIndex = index;
    }
    clearOptions() {
        const _selectBox = this.elem;
        for (let _i = _selectBox.length - 1; _i >= 0; _i--) {
            _selectBox.remove(_i);
        }
    }
    options() {
        return this.elem.options;
    }
    get value() {
        return this.options()[this.selectedIndex].val;
    }
    set value(val) {
        let _i;
        const _options = this.options();
        for (_i = 0; _i < _options.length; _i++) {
            if (val === _options[_i].val) {
                this.selectedIndex = _i;
                return;
            }
        }
    }
}
exports.Select = Select;
// An input class for the HTML input control
class Input extends ValueElement {
    constructor(owner) {
        super(owner);
    }
    createElement() {
        const _elem = document.createElement("input");
        _elem.setAttribute("type", this.inputType());
        if (this.is(CheckboxInput)) {
            _elem.onclick = (ev) => {
                this.fire({ type: "changed", target: this, previous: this._entryVal, current: _elem.checked });
            };
        }
        else {
            // Captures the onblur event from the input element and fires it in the context of this instance.
            _elem.onblur = (ev) => {
                this.fire({ type: "blurred", event: ev });
                this._exitVal = this.value;
                if (this._exitVal !== this._entryVal) {
                    this.fire({ type: "changed", target: this, previous: this._entryVal, current: this._exitVal });
                }
            };
            _elem.onfocus = (ev) => {
                this.fire({ type: "focused", event: ev });
                this._entryVal = this.value;
            };
        }
        return _elem;
    }
}
exports.Input = Input;
class StringInput extends Input {
    constructor(owner) {
        super(owner);
    }
    inputType() {
        return "string";
    }
    get value() {
        return this.elem.value;
    }
    set value(val) {
        const _current = this.value;
        if (_current !== val) {
            this.elem.value = val;
        }
    }
}
exports.StringInput = StringInput;
class NumberInput extends Input {
    constructor(owner) {
        super(owner);
    }
    inputType() {
        return "number";
    }
    get value() {
        return Number(this.elem.value);
    }
    set value(val) {
        const _current = this.value;
        if (_current !== Number(val)) {
            this.elem.value = val;
        }
    }
}
exports.NumberInput = NumberInput;
class CheckboxInput extends Input {
    constructor(owner) {
        super(owner);
    }
    inputType() {
        return "checkbox";
    }
    get value() {
        return Boolean(this.elem.checked);
    }
    set value(val) {
        if (this.value !== Boolean(val)) {
            this.elem.checked = val;
        }
    }
}
exports.CheckboxInput = CheckboxInput;
class DateInput extends Input {
    constructor(owner) {
        super(owner);
    }
    inputType() {
        return "date";
    }
    get value() {
        let _val = this.elem.value;
        if (_val) {
            _val = utils_1.toDateFromInputString(_val);
        }
        else {
            _val = undefined;
        }
        return _val;
    }
    set value(val) {
        // First change any non-date argument into a date.
        if (!(typeof val === "object")) {
            val = new Date(val);
        }
        const _current = this.value;
        if (val && (!_current || (_current.getTime() !== val.getTime()))) {
            this.elem.value = utils_1.toInputStringfromDate(val);
        }
    }
}
exports.DateInput = DateInput;
// A view manages the display of a single model. It is always contained within a div, which wraps the various
// document elements. It is important to note that HtElements, such as ivv.label and ivv.input, are NOT
// ivv.views, but instead are managed by view. Simply put, all views are HtElements, but not all HtElements
// are views.
class View extends HtElement {
    constructor(owner) {
        super(owner);
        this._model = undefined;
        this._shouldRefresh = true;
        this.on("created", () => {
            this.initializeView();
        });
    }
    get level() {
        return this._level;
    }
    initializeView() {
        if (this.owner) {
            const cv = this.owner;
            this._level = cv.level + 1;
        }
        else {
            this._level = 1;
        }
        this.classList.add("level-" + this.level);
    }
    createElement() {
        return document.createElement("div");
    }
    get model() {
        return this._model;
    }
    set model(mod) {
        if (mod !== this._model) {
            if (this._model) {
                this._model.views.remove(this);
            }
            this.destroy();
            this._model = mod;
            this._model.views.add(this);
            this.fire({ type: "constructing", target: this, model: mod });
            this.construct();
            this.fire({ type: "constructed", target: this, model: mod });
        }
    }
    insert(parentElem, refresh) {
        parentElem.appendChild(this.elem);
        if (this.is(View)) {
            if ((typeof refresh === "undefined") || refresh) {
                this.refresh();
            }
        }
    }
    destroy() {
        const _elem = this.elem;
        while (_elem.firstChild) {
            _elem.removeChild(_elem.firstChild);
        }
    }
    // this.refresh() updates the data displayed by the view and its associated HtElements. It responds to changes
    // in the data held by the existing model.
    refresh() {
    }
    get shouldRefresh() {
        return this._shouldRefresh;
    }
    set shouldRefresh(val) {
        this._shouldRefresh = val;
    }
}
exports.View = View;
class ControlView extends View {
    construct() {
        // Create a label for this view
        this.label = this.createLabel();
        this.label.classList.add("label");
        this.label.classList.add("level-" + this.level);
        // And an input control
        this.control = this.createControl();
        this.control.classList.add("control");
        this.control.classList.add("level-" + this.level);
    }
    refresh() {
        this.label.value = this.model.caption;
        this.control.value = this.model.displayValue ? this.model.displayValue : "";
    }
}
exports.ControlView = ControlView;
class DataPropertyView extends ControlView {
    constructor(owner) {
        super(owner);
        this.typeTable = {
            boolean: function (owner) { return ivy_1.$App.create(CheckboxInput, owner); },
            date: function (owner) { return ivy_1.$App.create(DateInput, owner); },
            number: function (owner) { return ivy_1.$App.create(NumberInput, owner); },
            string: function (owner) { return ivy_1.$App.create(StringInput, owner); },
        };
    }
    get model() {
        return super.model;
    }
    set model(mod) {
        super.model = mod;
    }
    // Override in subclasses to created the desired label field
    createLabel() {
        const _inst = ivy_1.$App.create(DivLabel, this);
        _inst.className = "label";
        this.appendChild(_inst);
        return _inst;
    }
    // Override in subclasses to create the desired control.
    createControl() {
        let _inst;
        const _model = this.model;
        if (_model.readOnly) {
            _inst = ivy_1.$App.create(DivLabel, this);
            _inst.classList.add("readOnly");
        }
        else if (_model.options) {
            _inst = ivy_1.$App.create(Select, this);
            _inst.initializeOptions(_model.options);
            _inst.classList.add("select");
        }
        else {
            _inst = this.typeTable[this.dataType](this);
            _inst.classList.add("input");
        }
        _inst.className = "control";
        _inst.classList.add(this.dataType);
        // This updates the model when the input control changes
        _inst.on("changed", (event) => {
            this.model.value = event.current;
        });
        this.classList.add("property");
        this.appendChild(_inst);
        return _inst;
    }
    get dataType() {
        return this.model.dataType;
    }
}
exports.DataPropertyView = DataPropertyView;
class PropertyGroup extends ControlView {
    constructor(owner) {
        super(owner);
        this.on("clicked", (event) => {
            alert("clicked");
        });
    }
    createLabel() {
        const _inst = ivy_1.$App.create(DivLabel, this);
        _inst.className = "label";
        _inst.classList.add("label");
        this.appendChild(_inst);
        _inst.onclick = (ev) => {
            this.properties.hidden = this.properties.hidden ? false : true;
            ev.cancelBubble = true;
        };
        return _inst;
    }
    createControl() {
        const _inst = ivy_1.$App.create(DivLabel, this);
        _inst.className = "control";
        _inst.classList.add("control");
        this.appendChild(_inst);
        _inst.onclick = (ev) => {
            this.properties.hidden = this.properties.hidden ? false : true;
            ev.cancelBubble = true;
        };
        return _inst;
    }
    createPropertyGroup() {
        const _inst = ivy_1.$App.create(Div, this);
        _inst.className = "properties";
        _inst.classList.add("properties");
        _inst.classList.add("level-" + this.level);
        this.appendChild(_inst);
        return _inst;
    }
    construct() {
        super.construct();
        this.properties = this.createPropertyGroup();
    }
}
exports.PropertyGroup = PropertyGroup;
class ComplexView extends PropertyGroup {
    constructor(owner) {
        super(owner);
    }
    createDataPropertyView() {
        return ivy_1.$App.create(DataPropertyView, this);
    }
    createView(prop) {
        let view;
        if (prop.is(ivy_1.$ID)) {
            // Ignore $IDs for now
        }
        else if (prop.is(ivy_1.$Collection)) {
            view = this.createCollectionView();
        }
        else if (prop.is(ivy_2.$Object)) {
            view = this.createObjectView();
        }
        else if (prop.is(ivy_2.$Value)) {
            view = this.createDataPropertyView();
        }
        return view;
    }
    get model() {
        return super.model;
    }
    set model(mod) {
        super.model = mod;
    }
    construct() {
        super.construct();
        if (this.model) {
            this.model.forEach((prop) => {
                let view;
                view = this.createView(prop);
                if (view) {
                    view.model = prop;
                    this.properties.appendChild(view);
                }
            });
        }
    }
    refresh() {
        super.refresh();
        if (this.shouldRefresh) {
            this.model.forEach((prop) => {
                prop.refreshViews();
            });
            //            this.shouldRefresh = false;
        }
    }
}
exports.ComplexView = ComplexView;
class AccordionView extends ComplexView {
    constructor(owner) {
        super(owner);
    }
    createCollectionView() {
        return ivy_1.$App.create(AccordionCollectionView, this);
    }
    createObjectView() {
        return ivy_1.$App.create(AccordionObjectView, this);
    }
    construct() {
        super.construct();
        if (this.level > 1) {
            this.properties.hidden = true;
        }
    }
}
exports.AccordionView = AccordionView;
class AccordionObjectView extends AccordionView {
    constructor(owner) {
        super(owner);
        this.classList.add("object");
    }
    get model() {
        return super.model;
    }
    set model(mod) {
        super.model = mod;
    }
}
exports.AccordionObjectView = AccordionObjectView;
class AccordionCollectionView extends AccordionView {
    constructor(owner) {
        super(owner);
        this.classList.add("collection");
    }
    get model() {
        return super.model;
    }
    set model(mod) {
        super.model = mod;
    }
}
exports.AccordionCollectionView = AccordionCollectionView;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const ivy_1 = __webpack_require__(0);
const ivy_2 = __webpack_require__(0);
const utils_1 = __webpack_require__(1);
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
const personClasses = {
    Person: {
        className: "Persons",
        factory: function (owner) { return ivy_1.$App.create(Person, owner); }
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
class Persons extends ivy_2.$TypedCollection {
    constructor(owner) {
        super(owner);
        this.factories = personClasses;
    }
}
exports.Persons = Persons;
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


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map