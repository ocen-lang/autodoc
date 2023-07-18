const search = document.getElementById('searchInput');
const breadcrumbDiv = document.getElementById('breadcrumbDiv');

let resultsDivs = [];
let selectedIndex = 0;
let prevX;
let prevY;

function searchDocs() {
    let results = new Map();
    let query = search.value;
    if (query.length === 0) {
        return results;
    }

    // search for start of word
    Object.entries(searchMapping).forEach(([fullName, [path, name, kind]]) => {
        if (name.toLowerCase().startsWith(query.toLowerCase())) {
            results.set(fullName, searchMapping[fullName]);
        }
    })

    // search for inclusion
    Object.entries(searchMapping).forEach(([fullName, [path, name, kind]]) => {
        if (results[fullName]) {
            return;
        }
        if (name.toLowerCase().includes(query.toLowerCase())) {
            results.set(fullName, searchMapping[fullName]);
        }
    })
    return results;
}

search.addEventListener('input', (e) => {
    if (search.value.length <= 0) {
        breadcrumbDiv.style.display = "flex";
        populatePage();
        return;
    }
    breadcrumbDiv.style.display = "none";
    const results = searchDocs();
    resultsDivs = [];
    selectedIndex = 0;
    if (results.size > 0) {
        main.innerHTML = "";
        results.forEach(([path, name, kind], fullName) => {
            let resultDiv = document.createElement('div');
            resultDiv.classList.add('search-result');

            let resultLink = document.createElement('a');
            resultLink.href = path;
            resultLink.textContent = name;
            resultDiv.appendChild(resultLink);

            resultDiv.appendText(` (${kind})`, "search-result-kind");

            let p = document.createElement('p');
            p.appendText(fullName, "description");
            resultDiv.appendChild(p);
            
            resultDiv.addEventListener('click', (e) => {
                resultLink.click();
            })
            resultDiv.addEventListener('mouseover', (e) => {
                if (e.x === prevX && e.y === prevY) {
                    return;
                }
                prevX = e.x;
                prevY = e.y;
                resultsDivs[selectedIndex].classList.remove('focused-result');
                selectedIndex = resultsDivs.indexOf(resultDiv);
                selectResult(0, false);
            })

            main.appendChild(resultDiv);
            resultsDivs.push(resultDiv);
            resultsDivs[0].classList.add('focused-result');
        })
    } else {
        main.innerHTML = "No results found";
    }
})

window.addEventListener('keypress', (e) => {
    search.focus();
})

window.addEventListener('keydown', (e) => {
    if (search.value.length === 0) {
        return;
    }
    if (e.key === "ArrowUp" && selectedIndex > 0) {
        e.preventDefault();
        selectResult(-1);
    } else if (e.key === "ArrowDown" && selectedIndex < resultsDivs.length - 1) {
        e.preventDefault();
        selectResult(1);
    } else if (e.key === "Backspace") {
        search.focus();
    } else if (e.key === "Enter") {
        e.preventDefault();
        resultsDivs[selectedIndex].querySelector('a').click();
    }
})

search.addEventListener('keydown', (e) => {
    if (e.key === "ArrowUp" && selectedIndex > 0) {
        e.preventDefault();
        search.blur();
    } else if (e.key === "ArrowDown" && selectedIndex < resultsDivs.length - 1) {
        e.preventDefault();
        search.blur();
    }
})

function selectResult(decrement= 0, scroll=true) {
    if (resultsDivs.length === 0) {
        return;
    }
    
    if (decrement !== 0) {
        resultsDivs[selectedIndex].classList.remove('focused-result');
        selectedIndex += decrement;
    }
    
    resultsDivs[selectedIndex].classList.add('focused-result');
    if (scroll) {
        resultsDivs[selectedIndex].scrollIntoView({ block: "nearest" });
    }
}