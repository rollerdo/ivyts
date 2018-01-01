import { decamelCase, enableEvents } from "./utils";
import { View } from "./views";

export function $ivy<T extends $Property>(c: { new(owner?: $Property): T }, owner?: $Property): T {
    const obj: T = new c(owner);
    obj.fire("created");
    return obj;
}

export type forEachFunc = (mem, i) => void;

abstract class IDFactory {
    public abstract createID(): string;
}

// Creates a globally-unique ID. Slowest but should be unique among all objects in the known universe.
class GUIDFactory extends IDFactory {
    public createID(): string {
        const guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    }
}

// Creates a locally-unique ID. Faster than guidFactory but only guaranteed unique within the Ivy universe.
class LUIDFactory extends IDFactory {
    private _seed = 1;

    public createID(): string {
        const _n = Number(new Date()) + this._seed++;
        if (this._seed > 100000) {
            this._seed = 1;
        }
        return _n.toString(16);
    }
}

const idFactory = new LUIDFactory();
const keyFactory = new LUIDFactory();

export abstract class $Property {

    private _owner: $Complex;
    private _views: ViewCollection;
    private _caption: string;
    private _clsName: string;
    private _key: string;

    protected constructor(owner?: $Complex) {
        enableEvents(this);
        this._key = keyFactory.createID();
        this._owner = owner;
    }

    // Stub for enableEvents()
    public fire(event) {
        return this;
    }

    // Stub for enableEvents()
    public on(type, method, parameters?) {
        return this;
    }

    public get caption(): string {
        if (!this._caption) {
            this._caption = decamelCase(this.className).trim();
        }
        return this._caption;
    }

    public set caption(v: string) {
        this._caption = v;
    }

    public get className() {
        if (!this._clsName) {
            this._clsName = this.constructor.name;
        }
        return this._clsName;
    }

    public set className(v: string) {
        this._clsName = v;
    }

    public get displayValue(): string {
        return this.className;
    }

    public get icon() {
        return undefined;
    }

    public is(cls: any): boolean {
        return this instanceof cls;
    }

    public get key() {
        return this._key;
    }

    public get owner(): $Complex {
        return this._owner;
    }

    public get root(): $Complex {
        let _root: $Property;
        if (this.is($Complex)) {
            _root = this;
        } else {
            _root = this.owner;
        }
        while (_root) {
            if (_root.owner) {
                _root = _root.owner;
            }
        }
        return _root as $Complex;
    }

    public fromJSON(json: string) {
        const reader = new $JSONReader();
        const obj = JSON.parse(json);
        reader.read(this, obj);
    }

    public toJSON() {
        const writer = new $JSONWriter();
        return writer.write(this);
    }

    public get readOnly(): boolean {
        return false;
    }

    public get views(): ViewCollection {
        if (!this._views) {
            this._views = this.createViewCollection();
        }
        return this._views;
    }

    // Override createViewCollection to add a more sophisticated collection object.
    protected createViewCollection(): ViewCollection {
        const _coll = $ivy<ViewCollection>(ViewCollection, this);

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
    public refreshViews(): void {
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

export abstract class $Complex extends $Property {

    protected constructor(owner?: $Complex) {
        super(owner);
    }

    public abstract forEach(func: forEachFunc): void;

    public abstract get count();

    public toArray(): $Property[] {
        const ar: $Property[] = [];
        this.forEach((prop) => {
            ar.push(prop);
        });
        return ar;
    }
}

export class $Collection extends $Complex {

    private _count: number = 0;
    protected _db: {} = {};
    private _factories;

    constructor(owner?: $Complex) {
        super(owner);
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

    public add(prop: $Property): void {
        this._db[prop.key] = prop;
        this._count++;
        this.fire({ type: "itemAdded", target: prop });
    }

    public contains(key: any): boolean {
        return this._db[key] ? true : false;
    }

    public get count(): number {
        return this._count;
    }

    public createMember(className): $Property {
        const cls = this.factories[className];
        return cls.factory(this);
    }

    public get displayValue() {
        return "Count: " + this.count;
    }

    public forEach(func: forEachFunc): void {
        let n: string;
        let i: number = 0;
        for (n in this._db) {
            func.call(this, this._db[n], i);
            i++;
        }
    }

    public get factories() {
        return this._factories;
    }

    public set factories(facs) {
        this._factories = facs;
    }

    public remove(prop: $Property): void {
        // Todo: We need to determine if delete causes garbage collection issues.
        delete (this._db[prop.key]);
        this._count--;
        this.fire({ type: "itemRemoved", target: prop });
    }

    public find(key: any): $Property {
        return this._db[key];
    }

    public toArray(): $Property[] {
        const ar: $Property[] = [];
        this.forEach((prop) => {
            ar.push(prop);
        });
        return ar;
    }
}

interface IView {
    construct();
    refresh();
}

export class $TypedCollection<T extends $Property> extends $Collection {

    public find(key: any): T {
        return this._db[key];
    }

    public toArray(): T[] {
        const ar: T[] = [];
        this.forEach((prop) => {
            ar.push(prop);
        });
        return ar;
    }
}

export class ViewCollection extends $TypedCollection<View> {
}

export abstract class $Object extends $Complex {

    protected _props: $Property[] = [];

    private _names = {};

    public byName(n): $Property {
        return this._names[n] as $Property;
    }

    public initProperties(): void {
        let _v: $Property, _n: string;
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

    public get count(): number {
        return this._props.length;
    }

    public forEach(func: forEachFunc): void {
        const count = this.count;
        for (let i: number = 0; i < count; i++) {
            func.call(this, this._props[i], i);
        }
    }

    public toArray(): $Property[] {
        return this._props;
    }

    protected constructor(owner?: $Complex) {
        super(owner);

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
}

// A stand-along document with its own unique ID
export abstract class $Persistent extends $Object {
    protected constructor(owner?: $Complex) {
        super(owner);
        this.ID.value = idFactory.createID();
        this.on("created", function (event) {
            this.ID.value = idFactory.createID();
            // Todo: Fix this at some point. initProperties() decamelCases the caption to "I D"
            this.ID.caption = "ID";
        });
    }

    public ID = new $ID(this);

    public get documentClass() {
        return "Persistent";
    }
}

// A larger group of logically related fields contained in a document. May be optional or mandatory
export abstract class $Section extends $Object {
    protected constructor(owner?: $Complex) {
        super(owner);
    }

    public get documentClass() {
        return "Section";
    }

    // By default a section is mandatory
    public get mandatory() {
        return true;
    }
}

// A small group of logically related mandatory fields (e.g. personal name) in a $Peristent object
export abstract class $Component extends $Object {

    public get documentClass() {
        return "Component";
    }
}

export type performFunc = (mem, i) => void;

export interface IAction {
    perform: performFunc;
    display: string;
}

export interface IOption<T> {
    value: T;
    display: string;
}

export interface IValue<T> {
    value(): T;
    value(T);
    convert(v: any): T;
    options: Array<IOption<T>>;
}

export abstract class $Value extends $Property {

    private _val: any;
    private _calculating: boolean = false;
    private _calculation;
    private _initialValue;
    private _options = undefined;

    protected constructor(owner?: $Complex) {
        super(owner);
    }

    public abstract convert(v: any): any;

    public get displayValue() {
        return this.value;
    }

    public abstract get dataType();

    public get value(): any {

        // Calculate if needed and go set to the current value
        if (!(typeof this._calculation === "undefined") && !(this._calculating)) {
            // Set the calc flag so we don't recurse on this
            this._calculating = true;
            this.value.set(this._calculation());
            // Clear the calc flag
            this._calculating = false;
        } else if (typeof this._val === "undefined" && this._initialValue) {
            // Do we need to do something with null values before returning? If so, set the value accordingly and return
            // the new value.
            // If no, has the nullVal parameter been passed with get()?
            // Has this.initialValue function been defined?
            this.value.set(this._initialValue());
        }
        return this._val;
    }

    public set value(v: any) {
        let equal: boolean;
        let event;
        const pval = this.convert(v);

        // Dates cannot be directly compared
        if (pval instanceof (Date)) {
            if (this._val instanceof (Date)) {
                equal = (pval.getTime() === this._val.getTime());
            } else {
                equal = false;
            }
        } else {
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

    public get options(): any {
        return this._options;
    }

    public set options(val: any) {
        this._options = val;
    }
}

export class $String extends $Value implements IValue<string> {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public convert(v: any): string {
        return v.toString();
    }

    public get dataType() {
        return "string";
    }

}

export class $ID extends $String {
    public get readOnly() {
        return true;
    }
}

export class $Number extends $Value implements IValue<number> {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public convert(v: any): number {
        return Number(v);
    }

    public get dataType() {
        return "number";
    }
}

export class $Date extends $Value implements IValue<Date> {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public convert(v: any): Date {
        if (v && typeof v !== "object") {
            v = new Date(v);
        }
        return (v);
    }

    public get dataType() {
        return "date";
    }

}

export class $Boolean extends $Value implements IValue<boolean> {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public convert(v: any): boolean {
        return Boolean(v);
    }

    public get dataType() {
        return "boolean";
    }

}

export class $Any extends $Value implements IValue<any> {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public convert(v: any): any {
        return v;
    }

    public get dataType() {
        return "any";
    }

}

const spaces: string = "                                                             ";

export abstract class $Writer<T> {

    protected _result: T;

    public write(prop: $Property, params?: any): T {
        this.initialize(prop, params);
        this.writeProperties(prop, params);
        this.finalize(prop, params);
        return this._result;
    }

    protected initialize(prop: $Property, params?: any): void {
    }

    protected finalize(prop: $Property, params?: any): void {
    }

    protected writeProperties(prop: $Property, params?: any) {
        if (prop.is($Collection)) {
            this.writeCollection(prop as $Collection, params);
        } else if (prop.is($Object)) {
            this.writeObject(prop as $Object, params);
        } else if (prop.is($Value)) {
            this.writeValue(prop as $Property, params);
        }
    }

    protected abstract writeCollection(prop: $Collection, params?: any);
    protected abstract writeObject(prop: $Object, params?: any);
    protected abstract writeValue(prop: $Property, params?: any);
}

export class $TextWriter extends $Writer<string> {
    protected _tab = 3;
    protected _result: string;

    constructor(tab?) {
        super();
        this._tab = tab ? tab : 3;
    }

    protected initialize(prop: $Property, params?: any): void {
        this._result = "";
    }

    protected finalize(prop: $Property, params?: any): void {
    }

    protected writeProperties(prop: $Property, level: number): void {
        const indent: string = spaces.substr(0, this._tab * level);
        this._result += indent + prop.caption + ": ";
        super.writeProperties(prop, level);
    }

    protected writeCollection(prop: $Collection, level) {
        this._result += prop.displayValue + "\n";
        prop.forEach((p: $Property) => {
            this.writeProperties(p, level + 1);
        });
    }

    protected writeObject(prop: $Object, level) {
        this._result += prop.displayValue + "\n";
        prop.forEach((p: $Property) => {
            this.writeProperties(p, level + 1);
        });
    }

    protected writeValue(prop: $Value, level) {
        this._result += prop.value + "\n";
    }
}

export class $JSONWriter extends $Writer<string> {

    protected _result: string;

    protected initialize(prop: $Property, params?: any): void {
        this._result = "";
    }

    protected finalize(prop: $Property, params?: any): void {
        this._result = "{" + this._result + "}";
    }

    protected writeProperties(prop: $Property): void {
        this._result += '"' + prop.className + '": ';
        super.writeProperties(prop);
    }

    protected writeCollection(prop: $Collection) {
        this._result += "[";
        prop.forEach((p: $Property, i: number) => {
            if (i) {
                this._result += ",";
            }
            this._result += "{";
            this.writeProperties(p);
            this._result += "}";
        });
        this._result += "]";
    }

    protected writeObject(prop: $Object) {
        this._result += "{";
        prop.forEach((p: $Property, i: number) => {
            if (i) {
                this._result += ",";
            }
            this.writeProperties(p);
        });
        this._result += "}";
    }

    protected writeValue(prop: $Value) {
        if ((prop.is($String) || prop.is($Date))) {
            this._result += '"' + (prop.value) + '"';
        } else {
            this._result += prop.value;
        }
    }
}

export class $JSONReader {
    public read(inst: $Property, source: any) {
        let name: string;
        for (name in source) {
            this.readProperties(inst, source[name]);
        }
    }

    public readProperties(parentInst: $Property, parentSource: any) {
        let n1: string;
        let childInst: $Property;
        let childSource: any;
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
                (childInst as $Value).value = childSource;
            } else if (childInst.is($Object)) {
                // Recursively read the child object's properties
                this.readProperties(childInst, childSource);
            } else if (childInst.is($Collection)) {
                const collInst = childInst as $Collection;
                let n2: string;
                let memberInst: $Property;
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
        }
    }
}

export class $App extends $Persistent  {
    public constructor(owner: $Complex) {
        super(owner);
    }
}
