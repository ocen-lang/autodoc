const nav = document.querySelector('#sideNav');
const main = document.querySelector('#main');
const toast = document.querySelector('#breadcrumb');

let currentURL = "#ocen"
let ids;
let docs;

const nodeMap = new Map([
    ["namespaces", "Modules"],
    ["builtins", "Builtins"],
    ["constants", "Constants"],
    ["variables", "Variables"],
    ["enums", "Enums"],
    ["structs", "Structs"],
    ["unions", "Unions"],
    ["functions", "Functions"],
    ["methods", "Methods"],
])

window.addEventListener('hashchange', (event) => {
    currentURL = window.location.hash;
    if (window.location.hash === "") {
        currentURL = "#ocen"
    }
    populateLocation();
})

function getIds() {
    fetch('/data/ids-min.json').then(response => {
        return response.json();
    }).then(data => {
        ids = data
    }).catch(err => {
        fetch('/autodoc/data/ids-min.json').then(response => {
            return response.json();
        }).then(data => {
            ids = data
        }).catch(err => {
            console.log(err);
        })
    })
}

function getDocs() {
    fetch('/data/docs-min.json').then(response => {
        return response.json();
    }).then(data => {
        docs = data
        parseNode(docs, "#");
        if (window.location.hash !== "") {
            currentURL = window.location.hash;
        }
        populateLocation();
    }).catch(err => {
        fetch('/autodoc/data/docs-min.json').then(response => {
            return response.json();
        }).then(data => {
            docs = data
            parseNode(docs, "#");
            if (window.location.hash !== "") {
                currentURL = window.location.hash;
            }

            populateLocation();
        }).catch(err => {
            console.log(err);
        })
    })
}

function addNavContent(node, name, title) {
    let header = genHeader(title);
    let ul = document.createElement('ul');

    Object.keys(node).forEach((grandchild) => {
        let li = document.createElement('li');
        li.appendChild(genLink(name, grandchild));
        ul.appendChild(li);
    })
    
    nav.appendChild(header);
    nav.appendChild(ul);
}

function addNamespaceContent(node, title) {
    main.appendChild(genHeader(title));
    let section = genSection();
    Object.entries(node).forEach(([name, child]) => {
        let h3 = document.createElement('h3');
        h3.appendChild(genLink("namespaces", name, "namespace"));
        h3.appendChild(genDescription(child));
        section.appendChild(h3);
    });
    main.appendChild(section);
}

function addBuiltinContent(node, title) {
    main.appendChild(genHeader(title));
    let section = genSection();
    Object.values(node).forEach((child) => {
        let h3 = document.createElement('h3');
        h3.appendChild(genLink("builtins", child.name));
        h3.appendChild(genDescription(child));
        section.appendChild(h3);
    });
    main.appendChild(section);
}

function addConstantVariableContent(node, title) {
    main.appendChild(genHeader(title))
    Object.values(node).forEach((child) => {
        main.appendChild(genVariable(child));
    })
}

function addEnumStructContent(node, title) {
    main.appendChild(genHeader(title))
    Object.values(node).forEach((child) => {
        main.appendChild(genSummary(child));
    })
}

function addFunctionMethodContent(node, title) {
    main.appendChild(genHeader(title))
    Object.values(node).forEach((child) => {
        main.appendChild(genFunctionSummary(child));
    })
}

function addMainContent(node) {
    if (node.description) {
        let descP = document.createElement('pre');
        descP.classList.add('full-description');
        let desc = node.description+"\n"
        evalLinks(desc, false, descP)
        main.appendChild(descP);
    }

    switch (node.kind) {
        case "union":
        case "struct":
            main.appendChild(genStruct(node));
            main.appendChild(document.createElement('br'))
            break;
        case "enum":
            main.appendChild(genEnum(node));
            main.appendChild(document.createElement('br'))
            break;
        case "method":
        case "function":
            main.appendChild(genFunction(node));
            main.appendChild(document.createElement('br'))
            break;
    }

    nodeMap.forEach((value, key) => {
        if (node[key] && Object.keys(node[key]).length > 0) {
            switch (key) {
                case "namespaces":
                    addNamespaceContent(node[key], value);
                    break;
                case "builtins":
                    addBuiltinContent(node[key], value);
                    break;
                case "constants":
                case "variables":
                    addConstantVariableContent(node[key], value);
                    break;
                case "enums":
                case "unions":
                case "structs":
                    addEnumStructContent(node[key], value);
                    break;
                case "functions":
                case "methods":
                    addFunctionMethodContent(node[key], value);
                    break;
                default:
                    console.log(node);
            }
            main.appendChild(document.createElement('br'))
        }
    })
}

function addBackAnchor() {
    let back = document.createElement('a');
    back.textContent = "< back";
    let prevUrl = currentURL.split("#")[1].split("/").slice(0, -2).join("/");
    back.href = "#" + prevUrl;
    nav.appendChild(back);
}

function populateLocation() {
    nav.innerHTML = "";
    main.innerHTML = "";

    let currentNode = docs;
    let breadcrumb = [];

    let currentLocation = currentURL.split("#")[1].split("/");

    currentLocation.forEach((item, index) => {
        currentNode = currentNode[item];

        // every other item is a breadcrumb
        if (index % 2 === 0) {
            breadcrumb.push(index);
        }
    })

    console.log(currentLocation, currentURL, currentNode)

    // add back button if not at root
    if (currentLocation.length > 1) {
        addBackAnchor();
    }

    nodeMap.forEach((value, key) => {
        if (currentNode[key] && Object.keys(currentNode[key]).length > 0) {
            if (key === "constants" || key === "variables") {
                return;
            }
            addNavContent(currentNode[key], key, value);
        }
    })
    addMainContent(currentNode)
    updateBreadcrumb(breadcrumb);
}

function updateBreadcrumb(breadcrumb) {
    toast.innerHTML = "";
    let currentLocation = currentURL.split("#")[1].split("/");

    for (let i = 0; i < breadcrumb.length; i++) {
        let a = document.createElement('a');
        a.textContent = currentLocation[breadcrumb[i]];
        let parts = currentLocation.slice(0, breadcrumb[i] + 1);
        a.href = "#" + parts.join("/");
        if (i !== 0) {
            toast.appendChild(document.createTextNode("​::"));
        }
        toast.appendChild(a);
    }
}

function setup() {
    getIds();
    getDocs();
}

setup();