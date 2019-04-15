
function getProductUrls(sitemap) {
    return sitemap.filter(str => {
        // Filter out non-product urls
        if(str.indexOf('/products/') === -1) {
            return false;
        }
        // If matches more than one url, remove url
        let matches = sitemap.map(s => s.indexOf(str) !== -1).filter(b => b);
        if(matches.length !== 1) {
            return false;
        }
        return true;
    })
}

module.exports = getProductUrls;