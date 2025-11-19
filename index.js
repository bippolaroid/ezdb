import EntryInput from "./EntryInput.mjs";
import ValueCell from "./ValueCell.mjs";

const settableTypes = ["string", "number"];
let savedFile;

const tableContainer = document.querySelector("#table-container");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const propertiesPanel = document.querySelector("#properties-panel");

const tableBody = document.createElement("tbody");


openFileButton?.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json"
    fileInput.style.display = "none";
    fileInput.click();

    fileInput.onchange = async () => {
        const files = fileInput.files;
        if (files && files.length > 0 && files[0].size > 0) {
            const file = files[0];
            const jsonFile = JSON.parse(await file.text());
            /**
             * @type {NestMap[]}
             */
            const entryArray = mapAllEntries(jsonFile);
            savedFile = entryArray;

            const tableElement = document.createElement("table");
            const tableHeadElement = document.createElement("thead");
            const tableCaption = document.createElement("caption");

            tableCaption.textContent = file.name;

            const tableHeadRow = document.createElement("tr");



            for (const schemaKey of entryArray[0]) {
                const tableHeadCell = document.createElement("td");
                tableHeadCell.classList = "col-head";
                tableHeadCell.textContent = schemaKey[0];
                tableHeadRow.appendChild(tableHeadCell);
            }

            const utilityButtonWrapper = document.createElement("section");
            utilityButtonWrapper.classList = "flex gap-sm";

            const saveAllButton = document.createElement("button");
            saveAllButton.classList = "button primary-button";
            saveAllButton.textContent = "Save all entries";
            saveAllButton.onclick = () => {
                for (const entryMap of entryArray) {
                    for (const [key, value] of entryMap) {
                        if (!(value instanceof Map)) {
                            const newCurrentValue = value.newValue.length > 0 ? value.newValue : value.currentValue;
                            const newHistory = value.history.length > 0 ? [...value.history, value.currentValue] : [];
                            const tempObj = {
                                currentValue: newCurrentValue,
                                newValue: "",
                                history: newHistory
                            }
                            entryMap.set(key, tempObj);
                        } else {
                            console.log("not", value);
                        }
                    }
                }
            }

            const exportButton = document.createElement("button");
            exportButton.classList = "button secondary-button";
            exportButton.textContent = "Export JSON";

            exportButton.onclick = () => {
                const newEntryArray = [];
                for (const entryMap of entryArray) {
                    const newEntryMap = new Map();
                    for (const [key, value] of entryMap) {
                        if (!(value instanceof Map)) {
                            newEntryMap.set(key, value.currentValue);
                        } else {
                            console.log("not", value);
                        }
                    }
                    newEntryArray.push(Object.fromEntries(newEntryMap));
                }
                const newJsonFile = JSON.stringify(newEntryArray, null, 2);
                const blob = new Blob([newJsonFile], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = file.name;
                a.click();
                URL.revokeObjectURL(url);
            }

            utilityButtonWrapper.appendChild(saveAllButton);
            utilityButtonWrapper.appendChild(exportButton);

            tableHeadElement.appendChild(tableCaption);
            tableHeadElement.appendChild(utilityButtonWrapper);

            tableElement.appendChild(tableHeadElement);
            tableBody.appendChild(tableHeadRow);

            for (const entryMap of entryArray) {
                const entryRow = document.createElement("tr");
                createCells(entryMap, entryRow);
                tableBody.appendChild(entryRow);
            }
            tableElement.appendChild(tableBody);
            if (tableContainer) tableContainer.innerHTML = "";
            tableContainer?.appendChild(tableElement);

            if (newFileButton instanceof HTMLButtonElement) newFileButton.disabled = true;
            newFileButton?.classList.add("disabled");
            openFileButton?.remove();
        }
    }
})

/**
 * 
 * @param {Object[]} entries 
 */
function mapAllEntries(entries) {
    const entryArray = [];
    for (const entry of entries) {
        const entryMap = new Map();
        mapEntry(entry, entryMap);
        entryArray.push(entryMap);
    }
    return entryArray;
}

/**
 * 
 * @param {*} entry 
 * @param {NestMap} map 
 */
function mapEntry(entry, map) {
    for (const key of Object.keys(entry)) {
        if (settableTypes.includes(typeof entry[key]) || settableTypes.includes(typeof entry[key][0])) {
            map.set(key, { currentValue: entry[key], newValue: "", history: [] });
        } else {
            const nestedEntryMap = new Map();
            mapEntry(entry[key], nestedEntryMap);
            map.set(key, nestedEntryMap);
        }
    }
}

/**
 * 
 * @typedef {Object} ValueObject
 * @property {string} currentValue
 * @property {string} newValue
 * @property {string[]} history
 * @typedef {Map<string, ValueObject | NestMap>} NestMap
 * @param {NestMap} entryMap 
 * @param {HTMLElement} entryTableRow 
 */
function createCells(entryMap, entryTableRow) {
    for (const valueSet of entryMap) {
        const valueField = valueSet[1];
        /**
         * @type {ValueCell}
         */
        let valueCell;

        if (!(valueField instanceof Map)) {
            valueCell = new ValueCell(entryMap, valueSet[0]);
            entryTableRow.appendChild(valueCell.element);


            valueCell.element.onclick = (e) => {
                e.stopPropagation();
                valueCell._selected = true;
                if (propertiesPanel) propertiesPanel.innerHTML = "";
                if (!(valueField instanceof Map)) {
                    if (propertiesPanel instanceof HTMLElement && tableContainer instanceof HTMLElement) {
                        propertiesPanel.style.display = "block";

                        const valueWrapper = document.createElement("div");
                        valueWrapper.style.display = "flex";
                        valueWrapper.style.flexDirection = "column";
                        valueWrapper.style.gap = "12px";

                        const valueLabel = document.createElement("label");
                        valueLabel.textContent = valueSet[0];
                        const valueInput = new EntryInput(entryMap, valueSet[0], valueCell);
                        valueInput.update();
                        valueWrapper.appendChild(valueLabel);
                        valueWrapper.appendChild(valueInput.element);
                        propertiesPanel.appendChild(valueWrapper);

                        /**
                         * 
                         * @param {Event} e 
                         */
                        function externalClose(e) {
                            if (e.target instanceof HTMLElement && !e.target.closest("#properties-panel") && propertiesPanel instanceof HTMLElement && tableContainer instanceof HTMLElement) {
                                propertiesPanel.style.display = "none";
                                propertiesPanel.innerHTML = "";
                                tableContainer.style.width = "100%";
                                valueCell._selected = false;
                                e.target?.removeEventListener("click", externalClose);
                                valueCell.update();
                            }
                        }
                        window?.addEventListener("click", externalClose);
                    }
                }
                valueCell.update();
            }
        }
    }
}