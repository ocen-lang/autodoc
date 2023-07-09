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
        case "field":
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
    let results = [];
    let query = search.value;
    if (query.length === 0) {
        return results;
    }
    Object.keys(mapping).forEach((key) => {
        if (key.toLowerCase().includes(query.toLowerCase())) {
            results.push([key, mapping[key]]);
        }
    })
    return results;
}

search.addEventListener('keyup', (e) => {
    if (search.value.length <= 0) {
        toast.style.display = "block";
        populateLocation();
        return;
    }
    toast.style.display = "none";
    const results = searchDocs();
    if (results.length > 0) {
        main.innerHTML = "";
        results.forEach(([name, [path, full_name]]) => {
            let a = document.createElement('a');
            a.href = path;
            a.textContent = name;
            main.appendChild(a);
            main.appendText(full_name, "punctuation")
            main.appendChild(document.createElement('br'));
        })
    } else {
        main.innerHTML = "No results found";
    }
})