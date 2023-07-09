const search = document.getElementById('searchInput');
const mapping = {};

function parseNode(node, path, name, depth) {
    switch (node.kind) {
        case "union":
        case "struct":
        case "enum":
        case "method":
        case "function":
        case "builtin":
        case "constant":
        case "variable":
        case "namespace":
            if (node.name) {
                mapping[node.name] = [
                    path.slice(0, -1),
                    name.slice(0, -2)
                ]
            }
            break;
    }
    Object.keys(node).forEach((key) => {
        let newName = name;
        if (depth % 2 == 0) {
            newName = name + key + "::"
        }
        let newPath = path + key + "/";
        if (Array.isArray(node[key]) || typeof node[key] === 'object') {
            parseNode(node[key], newPath, newName, depth + 1);
        }
    })
}

function setupSearch() {
    parseNode(docs, "#", "", 0);
}

function searchDocs() {
    let results = new Map();
    let query = search.value;
    if (query.length === 0) {
        return results;
    }
    
    // search for start of word
    Object.keys(mapping).forEach((key) => {
        if (key.toLowerCase().startsWith(query.toLowerCase())) {
            results.set(key, mapping[key]);
        }
    })
    
    // search for inclusion
    Object.keys(mapping).forEach((key) => {
        if (results[key]) {
            return;
        }
        if (key.toLowerCase().includes(query.toLowerCase())) {
            results.set(key, mapping[key]);
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
        results.forEach(([path, full_name], name) => {
            let resultDiv = document.createElement('div');
            resultDiv.classList.add('search-result');
            let resultLink = document.createElement('a');
            resultLink.href = path;
            resultLink.textContent = name;
            resultDiv.appendChild(resultLink);
            let p = document.createElement('p');
            p.appendText(full_name, "description");
            resultDiv.appendChild(p);
            
            main.appendChild(resultDiv);
        })
    } else {
        main.innerHTML = "No results found";
    }
})