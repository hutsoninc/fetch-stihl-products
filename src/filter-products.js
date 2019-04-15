
function filterProducts(productUrls, products) {
    return productUrls.filter(url => {
        for (let i = 0; i < products.length; i++) {
            let sku = products[i];
            if (url.indexOf(sku) !== -1) {
                return true;
            }
        }
        return false;
    });
}

module.exports = filterProducts;