const search = document.getElementById('searchInput');
const mapping = {};

function parseNode(node, path) {
    if (node.name) {
        mapping[node.name] = path.slice(0, -1);
    }
    Object.keys(node).forEach((key) => {
        if (Array.isArray(node[key])) {
            parseNode(node[key], path + key + "/");
        } else if (typeof node[key] === 'object') {
            parseNode(node[key], path + key + "/");
        }
    })
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
        results.forEach(([key, result]) => {
            let a = document.createElement('a');
            a.href = result;
            a.textContent = key;
            main.appendChild(a);
            main.appendChild(document.createElement('br'));
        })
    } else {
        main.innerHTML = "No results found";
    }
})