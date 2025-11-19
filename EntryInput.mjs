import ValueCell from "./ValueCell.mjs";

export default class EntryInput {
    constructor(map = new Map(), key = "", cell = new ValueCell()) {
        this._map = map;
        this._key = key;
        this._cell = cell;
        this._entryObject = this._map.get(this._key);
        /** @type {HTMLInputElement} */
        this.element = document.createElement("input");
        this.element.type = "text";
        this.update();
    }

    update() {
        if (!this._cell._modified) {
            this.element.value = this._entryObject.currentValue;
        } else {
            if (this._entryObject.currentValue.length > 0 && this._entryObject.newValue === "") {
                this._cell._modified = false;
                this.update();
            }
            this.element.value = this._entryObject.newValue;
        }
        this.element.onchange = () => {
            this._cell._modified = true;
            this._entryObject.newValue = this.element.value;
            this._cell.update();
        }
    }
}