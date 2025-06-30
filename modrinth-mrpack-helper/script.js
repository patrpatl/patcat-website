document.addEventListener('DOMContentLoaded', function () {
    const mrTable = document.getElementById('mrtable');
    const dlAll = document.getElementById('dlAll');
    const filters = document.getElementById('filters');
    const purpose = document.getElementById('proud');
    const fileInput = document.getElementById('jsonFileInput');
    const fileInputField = document.getElementById('fileInputField');
    const filCompat = document.getElementById('filCompat');
    let json_data = [];       // original, full data
    let visible_data = [];    // filtered or unfiltered, currently displayed

    // Convert bytes to human-readable format
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Render the table with filtered or full data
    function renderTable(fileList) {
        visible_data = fileList; // update displayed files

        const tbody = mrTable.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
        }

        if (Array.isArray(fileList)) {
            fileList.forEach(element => {
                const newRow = document.createElement('tr');
                const rowPath = document.createElement('td');
                const rowDom = document.createElement('td');
                const rowComp = document.createElement('td');
                const rowDls = document.createElement('td');
                const rowFS = document.createElement('td');

                rowPath.innerHTML = element.path;

                // Compatibility
                if (element.env.client === "required" && element.env.server === "required") {
                    rowComp.innerHTML = "Both";
                } else if (element.env.client === "required") {
                    rowComp.innerHTML = "Client";
                } else if (element.env.server === "required") {
                    rowComp.innerHTML = "Server";
                } else {
                    rowComp.innerHTML = "N/A";
                }

                // Extract domain from downloads link
                try {
                    const url = new URL(element.downloads);
                    rowDom.innerHTML = url.hostname;
                } catch (e) {
                    rowDom.innerHTML = "N/A";
                }
                if (rowDom.innerHTML != 'cdn.modrinth.com') {
                    newRow.classList.add('table-warning');
                    rowDom.classList.add("text-danger");
                    rowDls.addEventListener("click", function (e) {
                        e.preventDefault();
                        if (confirm(
                            "Warning!\n\n" +
                            "You are about to download from an untrusted domain: " + rowDom.innerHTML + ".\n" +
                            "This could put your computer at risk. Are you sure you want to continue?"
                        )) {
                            if (confirm("Proceed to download from this untrusted domain?")) {
                                window.open(element.downloads, '_blank');
                            }
                        }
                    });
                }

                rowFS.innerHTML = formatFileSize(element.fileSize);

                rowDls.innerHTML = `<a class="btn" href="${element.downloads}" target="_blank">
                    <span class="material-icons align-middle">download</span>
                </a>`;

                newRow.appendChild(rowPath);
                newRow.appendChild(rowDom);
                newRow.appendChild(rowComp);
                newRow.appendChild(rowFS);
                newRow.appendChild(rowDls);
                if (tbody) {
                    tbody.appendChild(newRow);
                }
            });
        }

        mrTable.hidden = false;
        fileInputField.hidden = true;
        filters.hidden = false;
        purpose.hidden = true;
    }

    // Handle file input
    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data.files)) {
                    json_data = data.files; // Save original data
                    renderTable(json_data); // Initially show all
                } else {
                    alert('Invalid file format: "files" array missing.');
                }
            } catch (err) {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
    });

    // Handle compatibility filter
    filCompat.addEventListener("change", function () {
        let selection = filCompat.value;
        let customData = structuredClone(json_data);

        if (selection === "2") {
            customData = customData.filter(element => element.env.server === "required");
        } else if (selection === "3") {
            customData = customData.filter(element => element.env.client === "required");
        }

        renderTable(customData);
    });

    // Download currently displayed files only
    dlAll.addEventListener("click", function () {
        if (Array.isArray(visible_data)) {
            visible_data.forEach(element => {
                window.open(element.downloads, '_blank');
            });
        }
    });
});
