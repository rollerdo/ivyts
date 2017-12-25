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
//# sourceMappingURL=utils.js.map