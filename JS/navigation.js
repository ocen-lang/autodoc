const nav = document.querySelector('#sideNav');
const main = document.querySelector('#main');
const toast = document.querySelector('#breadcrumb');

let currentLocation = ["ocen"];
let ids;
let docs;

function getIds() {
    fetch('../data/ids-min.json').then(response => {
        return response.json();
    }).then(data => {
        ids = data
    }).catch(err => {
        console.log(err);
    })
}

function getDocs() {
    fetch('../data/docs-min.json').then(response => {
        return response.json();
    }).then(data => {
        docs = data
        populateLocation();
    }).catch(err => {
        console.log(err);
    })
}

function addNavContent(node, name, title) {
    let h2 = document.createElement('h2');
    h2.textContent = title;
    let line = document.createElement('hr');
    let ul = document.createElement('ul');
    let keys = Object.keys(node);
    keys.forEach((grandchild) => {
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.textContent = grandchild;
        a.addEventListener('click', () => {
            currentLocation.push(name);
            currentLocation.push(grandchild);
            populateLocation();
        })
        li.appendChild(a);
        ul.appendChild(li);
    })
    nav.appendChild(h2);
    nav.appendChild(line);
    nav.appendChild(ul);
}

function addBackAnchor() {
    let back = document.createElement('a');
    back.textContent = "back";
    back.addEventListener('click', () => {
        currentLocation.pop();
        currentLocation.pop();
        populateLocation();
    })
    nav.appendChild(back);
}

function populateLocation() {
    nav.innerHTML = "";
    main.innerHTML = "";
    
    let currentNode = docs;
    let breadcrumb = [];
    
    currentLocation.forEach((item, index) => {
        currentNode = currentNode[item];
        
        // every other item is a breadcrumb
        if (index % 2 === 0) {
            breadcrumb.push(index);
        }
    })
    
    // add back button if not at root
    if (currentLocation.length > 1) {
        addBackAnchor();
    }
    
    const nodeMap = new Map([
        ["namespaces", "Modules"],
        ["builtins", "Builtins"],
        ["constants", "Constants"],
        ["variables", "Variables"],
        ["enums", "Enums"],
        ["structs", "Structs"],
        ["functions", "Functions"],
        ["methods", "Methods"],
    ])

    nodeMap.forEach((value, key) => {
        if (currentNode[key] && Object.keys(currentNode[key]).length > 0) {
            addNavContent(currentNode[key], key, value);
        }
    })
    
    // add main content
    updateBreadcrumb(breadcrumb);
    
    if (currentNode.kind === "namespace" && currentNode.description) {
        let description = document.createElement('p');
        description.textContent = currentNode.description;
        main.appendChild(description);
    }
    
    if (currentNode.kind === "builtin") {
        let h2 = document.createElement('h2');
        h2.textContent = currentNode.name;
        main.appendChild(h2);
        
        let description = document.createElement('p');
        description.textContent = currentNode.description;
        main.appendChild(description);
        main.appendChild(document.createElement('hr'));
    }

    if (currentNode.methods && Object.keys(currentNode.methods).length > 0) {
        let methods = document.createElement('h3');
        methods.textContent = "Methods";
        main.appendChild(methods);
        main.appendChild(document.createElement('hr'));


        let section = document.createElement('section');
        Object.values(currentNode.methods).forEach((method) => {
            let div = document.createElement('div');
            div.classList.add('method-function');
            let a = document.createElement('a');
            a.textContent = method.name;
            a.addEventListener('click', () => {
                currentLocation.push("methods");
                currentLocation.push(method.name);
                populateLocation();
            })
            let span = document.createElement('span');
            span.innerHTML = "("
            method["params"].forEach((param, index) => {
                if (param.name === "this" && index === 0) {
                    if (param.type[0] === "&") {
                        span.appendChild(document.createTextNode("&this"))
                    } else {
                        span.appendChild(document.createTextNode("this"))
                    }
                    return;
                }
                if (index !== 0) {
                    span.appendChild(document.createTextNode(", "));
                }
                let paramSpan = document.createElement('span');
                paramSpan.innerHTML = param.name;
                paramSpan.innerHTML += ": ";
                
                let typeSpan = parseType(param.name, param.type);
                paramSpan.appendChild(typeSpan);
                
                span.appendChild(paramSpan);
            })
            span.appendChild(document.createTextNode("): "));
            returnSpan = parseType(method.name, method.return.type);
            span.appendChild(returnSpan);
            
            
            div.appendChild(a);
            div.appendChild(span);
            section.appendChild(div);
            if (method.description) {
                let description = document.createElement('p');
                description.textContent = method.description;
                section.appendChild(description);
            }
        })
        main.appendChild(section);
    }
    
}

function parseType(name, type) {
    let span = document.createElement('span');
    span.classList.add('type');
    const re = /\{\{[a-f0-9]+}}/g;
    let matches = [...type.matchAll(re)];
    let prev = 0;
    console.log(matches);
    matches.forEach((match, index) => {
        span.appendChild(document.createTextNode(type.slice(prev, match.index)));
        prev = match.index + match[0].length;
        
        let a = document.createElement('a');
        let loc = ids[match[0].slice(2, -2)];
        a.innerHTML += loc[loc.length - 1];
        a.addEventListener('click', () => {
            currentLocation = loc;
            populateLocation();
        })
        span.appendChild(a);
    })
    span.appendChild(document.createTextNode(type.slice(prev)));

    console.log(span);
    return span;
}

function updateBreadcrumb(breadcrumb) {
    toast.innerHTML = "";
    
    // homeAnchor = document.createElement('a');
    // homeAnchor.addEventListener('click', () => {
    //     currentLocation = ["ocen"];
    //     populateLocation();
    // })
    // toast.appendChild(homeAnchor);
    
    for (let i = 0; i < breadcrumb.length; i++) {
        let a = document.createElement('a');
        a.textContent = currentLocation[breadcrumb[i]];
        a.addEventListener('click', () => {
            currentLocation = currentLocation.slice(0, breadcrumb[i] + 1);
            populateLocation();
        })
        if (i !== 0) {
            toast.appendChild(document.createTextNode("::"));
        }
        toast.appendChild(a);
    }
}

function setup() {
    getIds();
    getDocs();
}

setup();