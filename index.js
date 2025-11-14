const openFileButton = document.querySelector("#open-file");

openFileButton.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json"
    fileInput.style.display = "none";

    fileInput.addEventListener("change", async () => {
        if(fileInput.files.length > 0) {
            const mainContainer = document.querySelector("#main");
            for(const file of fileInput.files) {
                const container = document.createElement("section");
                container.classList = "file-wrapper";
                mainContainer.appendChild(container);
                const json = JSON.parse(await file.text());
                for(const key of Object.keys(json[0])){
                    const keyWrapper = document.createElement("div");
                    const label = document.createElement("span");
                    label.textContent = key;
                    const valueInput = document.createElement("input");
                    valueInput.type = "text";
                    valueInput.value = key.valueOf();
                    
                    keyWrapper.appendChild(label);
                    keyWrapper.appendChild(valueInput);

                    mainContainer.appendChild(keyWrapper)
                }
                const saveButton = document.createElement("button");
                saveButton.classList = "button primary-button";
                saveButton.textContent = "Save";

                mainContainer.appendChild(saveButton);
            }
        }
    })

    openFileButton.after(fileInput);

    fileInput.click();
})