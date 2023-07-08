HTMLElement.prototype.appendText = function(text) {
    this.appendChild(document.createTextNode(text));
}

const genLink = (parentName, childName) => {
    let a = document.createElement('a');
    a.appendText(childName);
    a.href = `${currentURL}/${parentName}/${childName}`
    return a;
}

const genDescription = (node) => {
    let description = document.createElement('span');
    description.classList.add('description');
    description.innerHTML = "&nbsp;// ";
    description.appendText(node.description);
    
    return description;
}

const genType = (type) => {
    let span = document.createElement('span');
    span.classList.add('type');

    const re = /\{\{[a-f0-9]+}}/g;
    let matches = [...type.matchAll(re)];
    let prev = 0;

    matches.forEach((match, index) => {
        span.appendText(type.slice(prev, match.index));
        prev = match.index + match[0].length;

        let a = document.createElement('a');
        let loc = ids[match[0].slice(2, -2)];
        a.innerHTML += loc.split("/").pop();
        a.href = loc
        span.appendChild(a);
    })
    span.appendText(type.slice(prev));
    
    return span;
}

const genParam = (param) => {
    let paramSpan = document.createElement('span');
    paramSpan.classList.add('param');
    paramSpan.appendText(param.name);
    paramSpan.appendText(": ");

    let typeSpan = genType(param.type);
    paramSpan.appendChild(typeSpan);
    
    return paramSpan;
}

const genFunctionSummary = (node) => {
    let functionSpan = document.createElement('span');
    functionSpan.classList.add('function');
    functionSpan.appendText("def ");
    functionSpan.appendChild(genLink(node.kind + "s", node.name));
    functionSpan.appendText("(");

    node["params"].forEach((param, index) => {
        if (param.name === "this" && index === 0) {
            if (param.type[0] === "&") {
                functionSpan.appendText("&this");
            } else {
                functionSpan.appendText("this");
            }
            return;
        }
        if (index !== 0) {
            functionSpan.appendText(", ");
        }
        functionSpan.appendChild(genParam(param));
    });
    functionSpan.appendText(")");
    
    if (node.return) {
        functionSpan.appendText(": ");
        functionSpan.appendChild(genType(node.return.type));
    }
    
    functionSpan.appendChild(genDescription(node));
    
    return functionSpan;
}

const genVariable = (node) => {
    let variableSpan = document.createElement('span');
    variableSpan.classList.add('variable');
    if (node.kind === "constant") {
        variableSpan.appendText("const ");
    } else {
        variableSpan.appendText("let ");
    }
    variableSpan.appendChild(genParam(node));
    variableSpan.appendChild(genDescription(node));
    
    return variableSpan;
}

const genSummary = (child) => {
    let summarySpan = document.createElement('span');
    summarySpan.classList.add(child.kind);
    summarySpan.appendText(child.kind + " ");
    summarySpan.appendChild(genLink(child.kind + "s", child.name));
    
    return summarySpan;
}

const genEnum = (node) => {
    let enumDiv = document.createElement('div');
    enumDiv.classList.add('enum');
    enumDiv.appendText("enum ");
    let nameSpan = document.createElement('span');
    nameSpan.classList.add('name');
    nameSpan.appendText(node.name + " ");
    enumDiv.appendChild(nameSpan);
    enumDiv.appendText("{");

    if (node.fields) {
        node.fields.forEach((field) => {
            let p = document.createElement('p');
            p.classList.add('field');
            p.appendText(field.name);
            p.appendChild(genDescription(field));
            enumDiv.appendChild(p);
        })
    }
    
    enumDiv.appendText("}");
    
    return enumDiv;
}

const genStruct = (node) => {
    let structDiv = document.createElement('div');
    structDiv.classList.add(node.kind);
    structDiv.appendText(node.kind + " ");
    let nameSpan = document.createElement('span');
    nameSpan.classList.add('name');
    if (node.is_templated) {
        nameSpan.appendText(node.name);
        nameSpan.appendText("<");
        node.template_params.forEach((param, index) => {
            if (index !== 0) {
                nameSpan.appendText(", ");
            }
            nameSpan.appendText(param);
        })
        nameSpan.appendText("> ");
    } else {
        nameSpan.appendText(node.name + " ");
    }
    structDiv.appendChild(nameSpan);
    structDiv.appendText("{");

    if (node.fields) {
        node.fields.forEach((field) => {
            let p = document.createElement('p');
            p.classList.add('field');
            p.appendChild(genParam(field));
            p.appendChild(genDescription(field));
            structDiv.appendChild(p);
        })
    }
    
    structDiv.appendText("}");
    
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

const genFunction = (node) => {
    let functionDiv = document.createElement('div');
    let p = document.createElement('p');
    p.classList.add('function');
    p.appendText("def ");
    p.appendText(node.name);
    p.appendText("(");
    functionDiv.appendChild(p);

    node["params"].forEach((param, index) => {
        let paramP = document.createElement('p');
        if (param.name === "this" && index === 0) {
            if (param.type[0] === "&") {
                paramP.appendText("&this");
            } else {
                paramP.appendText("this");
            }
        } else {
            paramP.appendChild(genParam(param));
        }
        paramP.appendText(",");
        paramP.appendChild(genDescription(param));
        functionDiv.appendChild(paramP);
    });
    let returnP = document.createElement('p');
    returnP.appendText(")");

    if (node.return) {
        returnP.appendText(": ");
        returnP.appendChild(genType(node.return.type));
        returnP.appendChild(genDescription(node.return));
    }
    functionDiv.appendChild(returnP);

    return functionDiv;
}
