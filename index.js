import EntryInput from "./EntryInput.mjs";

const settableTypes = ["string", "number"];

const mainContainer = document.querySelector("#main");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");

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
            const entriesMap = mapAllEntries(jsonFile);

            for (const entryMap of entriesMap) {
                const entryContainer = document.createElement("section");
                entryContainer.classList = "entry-wrapper";
                createTables(entryMap, entryContainer);
                const saveEntryButton = document.createElement("button");
                saveEntryButton.classList = "button secondary-button";
                saveEntryButton.textContent = "Save Entry";
                entryContainer.appendChild(saveEntryButton);
                mainContainer?.appendChild(entryContainer);
            }
            const saveAllButton = document.createElement("button");
            saveAllButton.classList = "button primary-button";
            saveAllButton.textContent = "Save all entries";
            newFileButton?.parentElement?.appendChild(saveAllButton);
            if (newFileButton && newFileButton instanceof HTMLButtonElement) newFileButton.disabled = true;
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
 * @param {NestMap} valueSet 
 * @param {HTMLElement} container 
 */
function createTables(valueSet, container) {
    for (const valueSubset of valueSet) {
        const valueSubsetWrapper = document.createElement("section");
        valueSubsetWrapper.classList = "kv-wrapper";

        const labelWrapper = document.createElement("div");
        labelWrapper.classList = "flex items-center gap-sm"

        const keyLabel = document.createElement("label");

        if (valueSubset[1] instanceof Map) {
            if (Number(valueSubset[0]) || Number(valueSubset[0]) === 0) {
                keyLabel.textContent = valueSubset[1].get("title").currentValue;
            } else {
                keyLabel.textContent = valueSubset[0];
            }
            labelWrapper.appendChild(keyLabel);
            valueSubsetWrapper.appendChild(labelWrapper);
            createTables(valueSubset[1], valueSubsetWrapper);
            container.appendChild(valueSubsetWrapper);
        } else if (valueSubset[1] instanceof Object) {
            keyLabel.textContent = valueSubset[0];
            labelWrapper.appendChild(keyLabel);
            const keyValue = new EntryInput(valueSubset[0]);
            keyValue.element.oninput = (event) => {
                /**
                 * @type {HTMLInputElement}
                 */
                let target;
                if (event.target instanceof HTMLInputElement) {
                    target = event.target;
                    valueSubset[1].newValue = target?.value;
                    if (valueSubset[1].newValue !== valueSubset[1].currentValue) {
                        const alert = document.createElement("div");
                        alert.classList = "basic-alert flex items-center";
                        alert.textContent = "Modified"
                        labelWrapper.appendChild(alert);
                    }
                }
            }

            keyValue.value = valueSubset[1].currentValue;

            valueSubsetWrapper.appendChild(labelWrapper);
            valueSubsetWrapper.appendChild(keyValue.element);

        }
        container.appendChild(valueSubsetWrapper);
    }
}