export function decamelCase(s: string): string {
    return s.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
        return str.toUpperCase();
    });
}

// Computes the age of this date in years.
export function age(dateNow: Date, dateThen: Date): number {
    if (!dateThen) {
        return null;
    }
    let _age = dateNow.getFullYear() - dateThen.getFullYear();
    const m = dateNow.getMonth() - dateThen.getMonth();
    if (m < 0 || (m === 0 && dateNow.getDate() < dateThen.getDate())) {
        _age--;
    }
    return _age;
}

export function foreachProp (that, props, func) {
    let _name;
    for (_name in props) {
        if (props.hasOwnProperty(_name)) {
            func.call(that, props[_name], _name);
        }
    }
}

export const enableEvents = function (that) {

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
        } else {
            registry[type] = [handler];
        }
        return this;
    };

    return that;
};
