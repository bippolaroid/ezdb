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

        if (this._selected) {
            this.element.style.filter = "brightness(200%)";
        } else {
            if (this.element.style.filter.length > 0) {
                this.element.style.filter = "";
            }
        }

        if (this._modified) {
            if (currentValue.length > 0 && newValue === "") {
                this._modified = false;
                this.element.textContent = currentValue;
            } else {
                this.element.textContent = newValue;
            }
        } else {
            this.element.textContent = currentValue;
        }
    }
}
