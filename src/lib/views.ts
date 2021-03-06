import { $Any, $Boolean, $Collection, $Complex, $Date, $ID, $ivy } from "./ivy";
import { $Object, $Property, $String, $Value } from "./ivy";
import { foreachProp, toDateFromInputString, toInputStringfromDate } from "./utils";

export abstract class HtElement extends $Object {

    private _oldDisplay: string;
    private _elem;
    protected _hidden: boolean = false;

    constructor(owner?: $Complex) {
        super(owner);
    }

    // Encapsulates the document model's appendChild
    public appendChild(inst) {
        // Since pro.elem is a protected variable, we don't have direct access to it via inst. We can,
        // however, fire an accessRequest event, passing the name of the member of the protected variable
        // (in this case "elem") which is returned in event.value.
        this.elem.appendChild(inst.elem);
    }

    protected get elem() {
        if (!this._elem) {
            this._elem = this.createElement();
        }
        return this._elem;
    }

    public get classList() {
        return this.elem.classList;
    }

    public focus() {
        this.elem.focus();
    }

    // Insert passes the document element into which we want to insert our view. This is NOT an ivy object
    // but a normal HTML document element, so we pass it the pointer to our document element.
    public insert(parentElem, refresh?) {
        parentElem.appendChild(this.elem);
    }

    public get hideable() {
        return (this.elem.childNodes.length > 0);
    }

    public get hidden(): boolean {
        return this._hidden;
    }

    public set hidden(val: boolean) {
        if (val && (!this._hidden)) {
            this._oldDisplay = this.elem.style.display;
            this.elem.style.display = "none";
            this._hidden = val;
        } else if ((!val) && this._hidden) {
            this._hidden = val;
            this.elem.style.display = this._oldDisplay;
        }
    }

    // Retrieve an attribute from the document element by its name
    public getAttribute(attribName) {
        return this.elem.getAttribute(attribName);
    }

    // Set an attribute on the document element by its name. val contains the value to set on the attribute
    public setAttribute(attribName, val) {
        this.elem.setAttribute(attribName, val);
    }

    // Get the current event handler for a specific event (passed as a string in eventName)
    public getEventHandler(eventName) {
        return this.elem[eventName];
    }

    public set onclick(func) {
        this.elem.onclick = func;
    }

    // Get the current event handler for a specific event (passed as a string in eventName)
    public setEventHandler(eventName, handler) {
        this.elem[eventName] = handler;
    }

    public get style() {
        return this.elem.style;
    }

    // Every HtElement must define the element type which it creates.
    protected abstract createElement();
}

// An unanadorned div, the simplest particle in our atomic model
export class Div extends HtElement {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public createElement() {
        return document.createElement("div");
    }

}

// Any view which manages a simple value data type (string, number, bool, date/time) exposes get/set methods, which
// manage access to the value associated with the element. For most document elements, this is simply the text value
// of the innerHTML property. (See the ivc.input type below, which overrides get/set, which in its case, is an attribute
// on the input document element

export abstract class ValueElement extends HtElement {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public set value(val) {
        const _elem = this.elem;
        // Don't waste our time we've already set this value. We don't want to re-display what is already displayed.
        if (_elem.innerHTML !== val) {
            _elem.innerHTML = val;
        }
    }

    public get value() {
        return this.elem.innerHTML;
    }

}

export class Label extends ValueElement {

    constructor(owner?: $Complex) {
        super(owner);
    }

    protected createElement() {
        return document.createElement("label");
    }
}

// A div class which functions as a text label, not as an outside wrapper for other document elements. It can be
// substitued for the label class above.

export class DivLabel extends ValueElement {

    constructor(owner?: $Complex) {
        super(owner);
    }

    protected createElement() {
        return document.createElement("div");
    }
}

export class Icon extends ValueElement {

    constructor(owner?: $Complex) {
        super(owner);
    }

    protected createElement() {
        return document.createElement("i");
    }
}

export class Button extends ValueElement {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public get value() {
        return this.elem.value;
    }

    public set value(val) {
        const _current = this.value;
        if (_current !== val) {
            this.elem.value = val;
        }
    }

    public createElement() {
        const _elem = document.createElement("input");
        _elem.type = "button";
        _elem.onclick = () => {
            this.fire({ type: "clicked", target: this });
        };
        return _elem;
    }
}

export class Select extends ValueElement {

    constructor(owner?: $Complex) {
        super(owner);
        this.on("created", () => {
            //            this.initializeOptions({ usa: "USA", cr: "Costa Rica" });
            //            this.initializeOptions(["USA", "Costa Rica" ]);
            this.initializeOptions([{ value: "usa", display: "USA" }, { value: "cr", display: "Costa Rica" }]);
            this._entryVal = this.value;
        });
    }

    private _entryVal;

    protected createElement() {
        const _elem = document.createElement("select") as HTMLSelectElement;

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

    public addOption(txt, val) {
        // Create the option element
        const _option = document.createElement("option") as HTMLOptionElement;
        // Set the displayed option value
        _option.text = txt;
        // We can't store the value in the option.value attribute, since it's always written as a string.
        // tslint:disable-next-line:no-string-literal
        _option["val"] = val;
        this.elem.options.add(_option);
    }

    // Builds an option list from the this.options function.
    protected initializeOptions(opts) {
        this.clearOptions();
        if (!Array.isArray(opts)) {
            foreachProp(this, opts, function (opt, name) { this.addOption(opt, name); });
        } else {
            opts.forEach((opt) => {
                if (typeof opt === "string") {
                    this.addOption(opt, opt);
                } else {
                    this.addOption(opt.display, opt.value);
                }
            });
        }
    }

    public get selectedIndex() {
        return this.elem.selectedIndex;
    }

    public set selectedIndex(index) {
        this.elem.selectedIndex = index;
    }

    public clearOptions() {
        const _selectBox = this.elem;
        for (let _i = _selectBox.length - 1; _i >= 0; _i--) {
            _selectBox.remove(_i);
        }
    }

    public options() {
        return this.elem.options;
    }

    public get value(): ValueElement {
        return this.options()[this.selectedIndex].val;
    }

    public set value(val: ValueElement) {
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

// An input class for the HTML input control
export abstract class Input extends ValueElement {

    constructor(owner?: $Complex) {
        super(owner);
    }

    private _entryVal;
    private _exitVal;

    protected abstract inputType();

    public createElement() {
        const _elem = document.createElement("input") as HTMLInputElement;
        _elem.setAttribute("type", this.inputType());

        if (this.is(CheckboxInput)) {
            _elem.onclick = (ev) => {
                this.fire({ type: "changed", target: this, previous: this._entryVal, current: _elem.checked });
            };
        } else {

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

export class StringInput extends Input {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public inputType() {
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

export class NumberInput extends Input {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public inputType() {
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

export class CheckboxInput extends Input {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public inputType() {
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

export class DateInput extends Input {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public inputType() {
        return "date";
    }

    public get value() {
        let _val = this.elem.value;
        if (_val) {
            _val = toDateFromInputString(_val);
        } else {
            _val = undefined;
        }
        return _val;
    }

    public set value(val) {

        // First change any non-date argument into a date.
        if (!(typeof val === "object")) {
            val = new Date(val);
        }
        const _current = this.value;
        if (val && (!_current || (_current.getTime() !== val.getTime()))) {
            this.elem.value = toInputStringfromDate(val);
        }
    }
}

// A view manages the display of a single model. It is always contained within a div, which wraps the various
// document elements. It is important to note that HtElements, such as ivv.label and ivv.input, are NOT
// ivv.views, but instead are managed by view. Simply put, all views are HtElements, but not all HtElements
// are views.

export abstract class View extends HtElement {

    protected _model: $Property = undefined;
    protected _level: number;

    public get level(): number {
        return this._level;
    }

    public constructor(owner?: $Complex) {
        super(owner);
        this.on("created", () => {
            this.initializeView();
        });
    }

    protected initializeView(): void {

        if (this.owner) {
            const cv: ComplexView = this.owner as ComplexView;
            this._level = cv.level + 1;
        } else {
            this._level = 1;
        }
        this.classList.add("level-" + this.level);
    }

    protected createElement(): HTMLElement {
        return document.createElement("div");
    }

    public get model(): $Property {
        return this._model;
    }

    public set model(mod: $Property) {
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

    public insert(parentElem, refresh?): void {
        parentElem.appendChild(this.elem);
        if (this.is(View)) {
            if ((typeof refresh === "undefined") || refresh) {
                this.refresh();
            }
        }
    }

    // this.construct() manages any necessary changes to the view's actual structure that are necessary as a result of
    // the assignment of a new model property.
    protected construct(): void {
        this.classList.add(this.className);
    }

    public destroy(): void {
        const _elem = this.elem;
        while (_elem.firstChild) {
            _elem.removeChild(_elem.firstChild);
        }
    }

    // this.refresh() updates the data displayed by the view and its associated HtElements. It responds to changes
    // in the data held by the existing model.
    public refresh(): void {
    }

}

export class FrameView extends View {
    protected construct(): void {
        this.classList.add("frame");
    }
}

export abstract class ControlView extends View {
    public control: ValueElement;
    public label: ValueElement;

    protected construct() {
        // Create a label for this view
        super.construct();
        this.label = this.createLabel();
        this.label.classList.add("label");
        this.label.classList.add("level-" + this.level);

        // And an input control
        this.control = this.createControl();
        this.control.classList.add("control");
        this.control.classList.add("level-" + this.level);
    }

    protected abstract createLabel(): ValueElement;
    protected abstract createControl(): ValueElement;

    public refresh() {
        this.label.value = this.model.caption;
        this.control.value = this.model.displayValue ? this.model.displayValue : "";
    }

}

export class DataPropertyView extends ControlView {

    constructor(owner?: $Complex) {
        super(owner);
    }

    public get model(): $Value {
        return super.model as $Value;
    }

    public set model(mod: $Value) {
        super.model = mod;
    }

    private typeTable = {
        boolean: function (owner) { return $ivy<CheckboxInput>(CheckboxInput, owner); },
        date: function (owner) { return $ivy<DateInput>(DateInput, owner); },
        number: function (owner) { return $ivy<NumberInput>(NumberInput, owner); },
        string: function (owner) { return $ivy<StringInput>(StringInput, owner); },
    };

    // Override in subclasses to created the desired label field
    protected createLabel() {
        const _inst = $ivy<DivLabel>(DivLabel, this);
        _inst.className = "label";
        this.appendChild(_inst);
        return _inst;
    }

    // Override in subclasses to create the desired control.
    protected createControl() {
        let _inst;
        const _model = this.model;
        if (_model.readOnly) {
            _inst = $ivy<DivLabel>(DivLabel, this);
            _inst.classList.add("readOnly");
        } else if (_model.options) {
            _inst = $ivy<Select>(Select, this);
            _inst.initializeOptions(_model.options);
            _inst.classList.add("select");
        } else {
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
        return (this.model as $Value).dataType;
    }

}

export class PropertyGroup extends ControlView {

    protected _pgrp: Div = undefined;
    protected _hdng: Div = undefined;
    protected _foot: Div = undefined;

    constructor(owner?: $Complex) {
        super(owner);
    }

    public get heading(): Div {
        if (!this._hdng) {
            this._hdng = this.createHeading();
        }
        return this._hdng;
    }

    public get main(): Div {
        if (!this._pgrp) {
            this._pgrp = this.createMain();
        }
        return this._pgrp;
    }

    public get footer(): Div {
        if (!this._foot) {
            this._foot = this.createFooter();
        }
        return this._foot;
    }

    protected createLabel() {
        const _inst = $ivy<DivLabel>(DivLabel, this);
        _inst.className = "label";
        _inst.classList.add("label");
        this.heading.appendChild(_inst);
        return _inst;
    }

    protected createControl() {
        const _inst = $ivy<DivLabel>(DivLabel, this);
        _inst.className = "control";
        _inst.classList.add("control");
        this.heading.appendChild(_inst);
        return _inst;
    }

    protected createMain(): Div {
        const _inst = $ivy<Div>(Div, this);
        _inst.className = "main";
        _inst.classList.add("main");
        _inst.classList.add("level-" + this.level);
        this.appendChild(_inst);
        return _inst;
    }

    protected createHeading(): Div {
        const _inst = $ivy<Div>(Div, this);
        _inst.className = "heading";
        _inst.classList.add("heading");
        _inst.classList.add("level-" + this.level);
        this.appendChild(_inst);
        return _inst;
    }

    protected createFooter(): Div {
        const _inst = $ivy<Div>(Div, this);
        _inst.className = "footer";
        _inst.classList.add("footer");
        _inst.classList.add("level-" + this.level);
        this.appendChild(_inst);
        return _inst;
    }

    public construct() {
        super.construct();
    }
}

export abstract class ComplexView extends PropertyGroup {

    constructor(owner?) {
        super(owner);
    }

    protected abstract createCollectionView(prop: $Property): ComplexView;
    protected abstract createObjectView(prop: $Property): ComplexView;
    protected createDataPropertyView(prop: $Property): DataPropertyView {
        return $ivy<DataPropertyView>(DataPropertyView, this);
    }

    protected createView(prop: $Property): ControlView {
        let view: ControlView;
        if (prop.is($ID)) {
            // Ignore $IDs for now
        } else if (prop.is($Collection)) {
            view = this.createCollectionView(prop);
        } else if (prop.is($Object)) {
            view = this.createObjectView(prop);
        } else if (prop.is($Value)) {
            view = this.createDataPropertyView(prop);
        }
        return view;
    }

    public get model(): $Complex {
        return super.model as $Object;
    }

    public set model(mod: $Complex) {
        super.model = mod;
    }

    public construct() {
        super.construct();
        if (this.model) {
            this.model.forEach((prop: $Property) => {
                let view: ControlView;
                view = this.createView(prop);
                if (view) {
                    view.model = prop;
                    this.main.appendChild(view);
                }
            });
        }
    }

    public refresh() {
        super.refresh();
        this.model.forEach((prop: $Property) => {
            prop.refreshViews();
        });
    }

}

enum accorionState {open, closed}
export class AccordionView extends ComplexView {

    public get owner (): Accordion {
        return super.owner as Accordion;
    }

    public constructor(owner?: $Complex) {
        super(owner);
        this.on("created", (event) => {
            if (this.level === 1) {
                this.classList.add("acc");
            } else if (this.level === 2) {
                this.classList.add("acc-folder");
            } else {
                this.classList.add("acc-section");
            }
            if (this.level === 2) {
                this.on("constructed", (ev) => {
                    this.main.hidden = true;
                    this.footer.hidden = true;
                    this.heading.onclick = (e) => {
                        this.owner.folderClicked(this);
                        e.cancelBubble = true;
                    };
                });
            }
        });
    }

    protected createCollectionView(): AccCollectionFolder {
        return $ivy<AccCollectionFolder>(AccCollectionFolder, this);
    }

    protected createObjectView(): AccObjectFolder {
        return $ivy<AccObjectFolder>(AccObjectFolder, this);
    }

    public construct() {
        super.construct();
    }
}

export class Accordion extends AccordionView {

    public get model(): $Object {
        return super.model as $Object;
    }

    public set model(mod: $Object) {
        super.model = mod;
    }

    public folderClicked(folder: AccordionView) {
        if (folder.main.hidden) {
            folder.main.hidden = false ;
            folder.footer.hidden = false ;
        } else {
            folder.main.hidden = true;
            folder.footer.hidden = true;
        }

    }

}

export class AccObjectFolder extends AccordionView {
    public constructor(owner?: $Complex) {
        super(owner);

    }

    public get model(): $Object {
        return super.model as $Object;
    }

    public set model(mod: $Object) {
        super.model = mod;
    }

}

export class AccCollectionFolder extends AccordionView {
    public constructor(owner?: $Complex) {
        super(owner);
        this.classList.add("accordion-collection");
    }

    public get model(): $Collection {
        return super.model as $Collection;
    }

    public set model(mod: $Collection) {
        super.model = mod as $Collection;
    }

}
