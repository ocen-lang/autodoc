const search = document.getElementById('searchInput');

function searchDocs() {
    let results = [];
    let query = search.value;
    for (let i = 0; i < docs.length; i++) {
        if (docs[i].title.toLowerCase().includes(query.toLowerCase())) {
            results.push(docs[i]);
        }
    }
    return results;
}

search.addEventListener('keyup', (e) => {
    const results = searchDocs();
})