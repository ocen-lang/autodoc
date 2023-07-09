const fs = require('fs');
let docs = JSON.parse(fs.readFileSync('../data/docs-min.json', 'utf8'));
const mapping = {};

function parseNode(node, path) {
    if (node.id) {
        mapping[node.id] = path.slice(0, -1);
    }
    // sort the keys in place alphabetically
    Object.keys(node).forEach((key) => {
        if (Array.isArray(node[key])) {
            parseNode(node[key], path + key + "/");
        } else if (typeof node[key] === 'object') {
            parseNode(node[key], path + key + "/");
        }
    })
}

// sort the object in place recursively
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

docs = sortObjectKeys(docs);
parseNode(docs, "#");
fs.writeFileSync('../data/ids-min.json', JSON.stringify(mapping, null, 0));
fs.writeFileSync('../data/docs-min.json', JSON.stringify(docs, null, 0));
