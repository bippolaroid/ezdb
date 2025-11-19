import ValueCell from "./ValueCell.mjs";

export default class EntryInput {
    constructor(map = new Map(), key = "", cell = new ValueCell()) {
        this._map = map;
        this._key = key;
        this._cell = cell;
        this._entryObject = this._map.get(this._key);
        /** @type {HTMLInputElement} */
        this.element = this.render();
    }

    render() {
        const input = document.createElement("input");
        input.type = "text";
        if (!this._cell._modified) {
            input.value = this._entryObject.currentValue;
        } else {
            input.value = this._entryObject.newValue;
        }
        input.onchange = () => {
            this._cell._modified = true;
            this._entryObject.newValue = input.value;
            this._cell.update();
        }
        return input;
    }
}