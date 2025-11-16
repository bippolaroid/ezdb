export default class EntryInput {
    constructor(name = "", value = "") {
        this._name = name;
        this._value = value;
        /** @type {HTMLInputElement} */
        this.element = this.render();
        this.element.value = this._value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
        if (this.element) {
            this.element.value = value;
        }
    }

    render() {
        const input = document.createElement("input");
        input.type = "text";
        return input;
    }
}