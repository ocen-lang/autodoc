const search = document.getElementById('searchInput');

function searchDocs() {
    let results = new Map();
    let query = search.value;
    if (query.length === 0) {
        return results;
    }

    // search for start of word
    Object.keys(searchMapping).forEach((key) => {
        if (key.toLowerCase().startsWith(query.toLowerCase())) {
            results.set(key, searchMapping[key]);
        }
    })

    // search for inclusion
    Object.keys(searchMapping).forEach((key) => {
        if (results[key]) {
            return;
        }
        if (key.toLowerCase().includes(query.toLowerCase())) {
            results.set(key, searchMapping[key]);
        }
    })
    return results;
}

search.addEventListener('input', (e) => {
    if (search.value.length <= 0) {
        toast.style.display = "block";
        populatePage();
        return;
    }
    toast.style.display = "none";
    const results = searchDocs();
    if (results.size > 0) {
        main.innerHTML = "";
        results.forEach(([path, full_name, kind], name) => {
            let resultDiv = document.createElement('div');
            resultDiv.classList.add('search-result');

            let resultLink = document.createElement('a');
            resultLink.href = path;
            resultLink.textContent = name;
            resultDiv.appendChild(resultLink);

            resultDiv.appendText(` (${kind})`, "search-result-kind");

            let p = document.createElement('p');
            p.appendText(full_name, "description");
            resultDiv.appendChild(p);

            main.appendChild(resultDiv);
        })
    } else {
        main.innerHTML = "No results found";
    }
})