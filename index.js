const settableTypes = ["string", "number"];

const mainContainer = document.querySelector("#main");
const tableContainer = document.querySelector("#table-container");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
/**
 * @type {HTMLDivElement}
 */
const valueModal = document.querySelector("#value-modal");

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
            const entriesMap = mapAllEntries(jsonFile);

            const tableElement = document.createElement("table");
            const tableCaption = document.createElement("caption");

            tableCaption.textContent = file.name;

            const tableBody = document.createElement("tbody");
            const tableHeadRow = document.createElement("tr");

            for (const schemaKey of entriesMap[0]) {
                const tableHeadCell = document.createElement("td");
                tableHeadCell.classList = "col-head";
                tableHeadCell.scope = "col";
                tableHeadCell.textContent = schemaKey[0];
                tableHeadRow.appendChild(tableHeadCell);
            }

            tableElement.appendChild(tableCaption);
            tableBody.appendChild(tableHeadRow);

            for (const entryMap of entriesMap) {
                const entryRow = document.createElement("tr");
                createCells(entryMap, entryRow);
                tableBody.appendChild(entryRow);
            }
            tableElement.appendChild(tableBody);
            if (tableContainer) tableContainer.innerHTML = "";
            tableContainer?.appendChild(tableElement);

            const saveAllButton = document.createElement("button");
            saveAllButton.classList = "button primary-button";
            saveAllButton.textContent = "Save all entries";
            newFileButton?.parentElement?.appendChild(saveAllButton);
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
 * @typedef {Map<string, Object | NestMap>} NestMap
 * @param {NestMap} entryMap 
 * @param {HTMLElement} entryRow 
 */
function createCells(entryMap, entryRow) {
    for (const valueSet of entryMap) {
        const valueField = valueSet[1];
        const valueCell = document.createElement("td");

        if (valueField instanceof Map) {
            valueCell.textContent = "map";
        } else if (valueField instanceof Object) {
            valueCell.textContent = valueField.currentValue;
        }

        valueCell.addEventListener("click", (e) => {
            e.stopPropagation();
            valueModal.style.display = "block";
            /*
            valueModal.style.left = (valueCell.getBoundingClientRect().left - 1).toString();
            valueModal.style.top = (valueCell.getBoundingClientRect().bottom - 1).toString();
            valueModal.style.width = (valueCell.getBoundingClientRect().width + 2).toString();
            */

            /**
             * 
             * @param {Event} e 
             */
            function externalClose(e) {
                valueModal.style.display = "none";
                e.target?.removeEventListener("click", externalClose);
            }

            mainContainer?.addEventListener("click", externalClose)
        })

        entryRow.appendChild(valueCell);
    }
}