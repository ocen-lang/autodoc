const ids = {};
const searchMapping = {};
let docs;

function parseNode(node, path, name, depth) {
    if (node.id) {
        ids[node.id] = path.slice(0, -1);
    }
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
                searchMapping[node.name] = [
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

function sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;  // Return if the object is not a plain object or array
    }

    if (Array.isArray(obj)) {
        // If object is an array, sort its items
        return obj.map(sortObjectKeys);
    }

    // Get the keys, sort them, and create a new object with sorted keys
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = sortObjectKeys(obj[key]);  // Apply the sort function recursively to the nested objects
            return result;
        }, {});
}

async function setup() {
    let response = await fetch('/data/docs-min.json');
    if (response.status !== 200) {
        response = await fetch('/autodoc/data/docs-min.json');
    }
    
    let jsonDocs = await response.json();
    docs = sortObjectKeys(jsonDocs);
    parseNode(docs, "#", "", 0);
    
    if (window.location.hash !== "") {
        currentURL = window.location.hash;
    }
    populatePage();
}

setup();
