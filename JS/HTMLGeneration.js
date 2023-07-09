HTMLElement.prototype.appendText = function(text, className) {
    if (className) {
        let span = document.createElement('span');
        span.classList.add(className);
        span.appendChild(document.createTextNode(text));
        this.appendChild(span);
    } else {
        this.appendChild(document.createTextNode(text));
    }
}

const genLink = (parentName, childName, className) => {
    let a = document.createElement('a');
    if (className) {
        a.classList.add(className);
    }
    a.appendText(childName);
    a.href = `${currentURL}/${parentName}/${childName}`
    return a;
}

const genDescription = (node) => {
    let description = document.createElement('span');
    description.classList.add('description');
    if (node.description) {
        description.innerHTML = "&nbsp;// ";
        let firstLine = node.description.split("\n")[0].trim();
        description.appendChild(evalLinks(firstLine));
    }
    return description;
}

const colourizeType = (type) => {
    let span = document.createElement('span');
    for (x of type) {
        if (x === "&") {
            span.appendText(x, "keyword");
        } else if (x.match(/[a-zA-Z]/)) {
            span.appendText(x, "name");
        } else {
            span.appendText(x, "punctuation");
        }
    }

    return span;
}

const convertLinksToMarkdown = (text) => {
    let new_text = "";
    const re = /\{\{[a-f0-9]+}}/g;
    let matches = [...text.matchAll(re)];
    let prev = 0;

    matches.forEach((match, index) => {
        new_text += text.slice(prev, match.index);
        prev = match.index + match[0].length;

        let loc = ids[match[0].slice(2, -2)];
        let name = loc.split("/").pop();
        new_text += `[${name}](${loc})`;
    })
    new_text += text.slice(prev);
    return new_text;
}

const evalLinks = (type, colourize, parent) => {
    if (!parent) {
        parent = document.createElement('span');
        parent.classList.add('type');
    }

    const re = /\{\{[a-f0-9]+}}/g;
    let matches = [...type.matchAll(re)];
    let prev = 0;

    matches.forEach((match, index) => {
        let text = type.slice(prev, match.index);
        if (colourize) {
            parent.appendChild(colourizeType(text));
        } else {
            parent.appendText(text);
        }
        prev = match.index + match[0].length;

        let a = document.createElement('a');
        let loc = ids[match[0].slice(2, -2)];
        a.innerHTML += loc.split("/").pop();
        a.href = loc
        parent.appendChild(a);
    })
    let text = type.slice(prev);
    if (colourize) {
        parent.appendChild(colourizeType(text));
    } else {
        parent.appendText(text);
    }
    return parent;
}

const genParam = (param) => {
    let paramSpan = document.createElement('span');
    paramSpan.classList.add('param');
    paramSpan.appendText(param.name);
    paramSpan.appendText(": ", "punctuation");

    let typeSpan = evalLinks(param.type, true);
    paramSpan.appendChild(typeSpan);

    return paramSpan;
}

const genFunctionSummary = (node) => {
    let functionSpan = document.createElement('span');
    functionSpan.classList.add('function');
    functionSpan.appendText("def ", "keyword");
    functionSpan.appendChild(genLink(node.kind + "s", node.name, "callable"));
    functionSpan.appendText("(", "punctuation");

    node["params"].forEach((param, index) => {
        if (param.name === "this" && index === 0) {
            if (param.type[0] === "&") {
                functionSpan.appendText("&", "keyword");
            }
            functionSpan.appendText("this", "this-param");
            return;
        }
        if (index !== 0) {
            functionSpan.appendText(", ", "punctuation");
        }
        functionSpan.appendChild(genParam(param));
    });
    functionSpan.appendText(")", "punctuation");

    if (node.return) {
        functionSpan.appendText(": ", "punctuation");
        functionSpan.appendChild(evalLinks(node.return.type, true));
    }

    functionSpan.appendChild(genDescription(node));

    return functionSpan;
}

const genVariable = (node) => {
    let variableSpan = document.createElement('span');
    variableSpan.classList.add('variable');
    if (node.kind === "constant") {
        variableSpan.appendText("const ", "keyword");
    } else {
        variableSpan.appendText("let ", "keyword");
    }
    variableSpan.appendChild(genParam(node));
    variableSpan.appendChild(genDescription(node));

    return variableSpan;
}

const genSummary = (child) => {
    let summarySpan = document.createElement('span');
    summarySpan.classList.add(child.kind);
    summarySpan.appendText(child.kind + " ", "keyword");
    summarySpan.appendChild(genLink(child.kind + "s", child.name));
    summarySpan.appendChild(genDescription(child));

    return summarySpan;
}

const genEnum = (node) => {
    let enumDiv = document.createElement('div');
    enumDiv.classList.add('enum');
    enumDiv.appendText("enum ", "keyword");
    let nameSpan = document.createElement('span');
    nameSpan.classList.add('name');
    nameSpan.appendText(node.name + " ");
    enumDiv.appendChild(nameSpan);
    enumDiv.appendText("{", "punctuation");

    if (node.fields) {
        node.fields.forEach((field) => {
            let p = document.createElement('p');
            p.classList.add('field-long');
            p.appendText(field.name);
            p.appendChild(genDescription(field));
            enumDiv.appendChild(p);
        })
    }

    enumDiv.appendText("}", "punctuation");

    return enumDiv;
}

const genStruct = (node) => {
    let structDiv = document.createElement('div');
    structDiv.classList.add(node.kind);
    structDiv.appendText(node.kind + " ", "keyword");
    let nameSpan = document.createElement('span');
    nameSpan.classList.add('name');
    if (node.is_templated) {
        nameSpan.appendText(node.name);
        nameSpan.appendText("<", "punctuation");
        node.template_params.forEach((param, index) => {
            if (index !== 0) {
                nameSpan.appendText(", ", "punctuation");
            }
            nameSpan.appendText(param);
        })
        nameSpan.appendText("> ", "punctuation");
    } else {
        nameSpan.appendText(node.name + " ");
    }
    structDiv.appendChild(nameSpan);
    structDiv.appendText("{", "punctuation");

    if (node.fields) {
        node.fields.forEach((field) => {
            let p = document.createElement('p');
            p.classList.add('field-long');
            p.appendChild(genParam(field));
            p.appendChild(genDescription(field));
            structDiv.appendChild(p);
        })
    }

    structDiv.appendText("}", "punctuation");

    return structDiv;
}

const genHeader = (title) => {
    let header = document.createElement('div');
    header.classList.add('header');
    let h2 = document.createElement('h2');
    h2.textContent = title;
    header.appendChild(h2);
    header.appendChild(document.createElement('hr'));

    return header;
}

const genSection = () => {
    let section = document.createElement('div');
    section.classList.add('section');
    return section;
}

const genFunction = (node) => {
    let functionDiv = document.createElement('div');
    let p = document.createElement('p');
    p.classList.add('name');
    p.appendText("def ", "keyword");
    if (node.kind === "method") {
        p.appendChild(evalLinks(node.parent));
        p.appendText("::", "punctuation");
    }
    p.appendText(node.name, "callable");
    p.appendText("(", "punctuation");
    functionDiv.appendChild(p);

    node["params"].forEach((param, index) => {
        let paramP = document.createElement('p');
        paramP.classList.add('param-long');
        if (param.name === "this" && index === 0) {
            if (param.type[0] === "&") {
                paramP.appendText("&", "keyword");
            }
            paramP.appendText("this", "this-param");
        } else {
            paramP.appendChild(genParam(param));
        }
        paramP.appendText(",", "punctuation");
        paramP.appendChild(genDescription(param));
        functionDiv.appendChild(paramP);
    });
    let returnP = document.createElement('p');
    returnP.appendText(")", "punctuation");

    if (node.return) {
        returnP.appendText(": ", "punctuation");
        returnP.appendChild(evalLinks(node.return.type, true));
        returnP.appendChild(genDescription(node.return));
    }
    functionDiv.appendChild(returnP);

    return functionDiv;
}
