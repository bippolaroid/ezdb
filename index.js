const kvMap = new Map();
const settableTypes = ["string", "number"];

const mainContainer = document.querySelector("#main");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");

const saveAllButton = document.createElement("button");
saveAllButton.classList = "button primary-button";
saveAllButton.textContent = "Save all Entries";

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

            const container = document.createElement("section");
            container.classList = "file-wrapper";

            const jsonFile = JSON.parse(await file.text());

            importFile(jsonFile, kvMap);

            if (kvMap.size > 0) {
                createTables(kvMap, container);
            }

            const saveEntryButton = document.createElement("button");
            saveEntryButton.classList = "button primary-button";
            saveEntryButton.textContent = "Save Entry";

            container.appendChild(saveEntryButton);

            newFileButton?.parentElement?.appendChild(saveAllButton);
            newFileButton?.remove();
            openFileButton?.remove();

            mainContainer?.appendChild(container);
        }
    }
})

function createTables(set, container) {
    for (const subset of set) {
        const wrapper = document.createElement("section");
        wrapper.classList = "kv-wrapper";

        const keyLabel = document.createElement("label");

        if (Array.isArray(subset[1]) || subset[1] instanceof Map) {
            keyLabel.textContent = subset[0];
            wrapper.appendChild(keyLabel);
            createTables(subset[1], wrapper);
            container.appendChild(wrapper);
        } else {
            const keyValue = document.createElement("input");
            keyValue.value = subset[1].currentValue;

            wrapper.appendChild(keyLabel);
            wrapper.appendChild(keyValue);
        }
        container.appendChild(wrapper);
    }
}

function importFile(file, map) {
    for (const entry of file) {
        entryToKVMap(entry, map);
    }
}

function entryToKVMap(entry, map) {
    for (const key of Object.keys(entry)) {
        if (settableTypes.includes(typeof entry[key]) || settableTypes.includes(typeof entry[key][0])) {
            map.set(key, { currentValue: entry[key], newValue: "", history: [] });
        } else {
            const subMap = new Map();
            entryToKVMap(entry[key], subMap);
            map.set(key, subMap);
        }
    }
}