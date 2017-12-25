"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ivy_1 = require("./ivy");
const ivy_2 = require("./ivy");
const utils_1 = require("./utils");
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
    getContext() {
        return "view";
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
//# sourceMappingURL=Views.js.map