export default class ValueCell {
    constructor(map = new Map(), key = "") {
        this._selected = false;
        this._modified = false;
        this._map = map;
        this._key = key;
        this.element = document.createElement("td");
        this.update();
    }

    update() {
        const { currentValue, newValue } = this._map.get(this._key);

        this.element.textContent = this._modified
            ? newValue
            : currentValue;
    }

    render() {
        this.update();
        return this.element;
    }
}
