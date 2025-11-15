const kvMap = new Map();
const settableTypes = ["string", "number"];

const mainContainer = document.querySelector("#main");
const openFileButton = document.querySelector("#open-file");

const saveButton = document.createElement("button");
saveButton.classList = "button primary-button";
saveButton.textContent = "Save";

if (openFileButton) {
    openFileButton.addEventListener("click", () => {
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

                mainContainer?.appendChild(container);
                mainContainer?.appendChild(saveButton);
            }
        }
    })
}

function createTables(set, container) {
    for (const subset of set) {
        const frag = document.createDocumentFragment();
        if (Array.isArray(subset[1]) || subset[1] instanceof Map) {
            const wrapper = document.createElement("section");
            wrapper.classList = "kv-wrapper";

            const keyLabel = document.createElement("label");
            keyLabel.textContent = subset[0];

            wrapper.appendChild(keyLabel);

            createTables(subset[1], wrapper);

            frag.appendChild(wrapper);
        } else {
            const wrapper = document.createElement("section");
            wrapper.classList = "kv-wrapper";

            const keyLabel = document.createElement("label");
            keyLabel.textContent = subset[0];

            const keyValue = document.createElement("input");
            keyValue.value = subset[1].currentValue;
            console.log(subset[1]);

            wrapper.appendChild(keyLabel);
            wrapper.appendChild(keyValue);

            frag.appendChild(wrapper);
        }
        container.appendChild(frag);
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