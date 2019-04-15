const fetchSitemap = require('./fetch-sitemap');
const getProductUrls = require('./get-product-urls');
const filterProducts = require('./filter-products');
const getProductData = require('./get-product-data');
const Promise = require('bluebird');

const defaultOptions = {
    url: 'https://hutsonmayfield.stihldealer.net',
    sitemap: 'sitemap.xml',
    headers: {},
    Promise,
};

/**
 * 
 * @param {Array} products Product SKUs to keep
 * @param {Object} options Options
 */

async function fetchProducts(products, options = {}) {
    // If first argument is an object, use as options
    if (products && typeof products === 'object' && !Array.isArray(products)) {
        options = Object.assign(defaultOptions, products);
    } else {
        options = Object.assign(defaultOptions, options);
    }

    // Append / to URL
    if (options.url.charAt(options.url.length - 1) !== '/') {
        options.url = options.url + '/';
    }

    // Get all URLs in sitemap
    const sitemap = await fetchSitemap(options);

    // Remove non-product pages
    let productUrls = getProductUrls(sitemap);

    // Filter products
    if (products) {
        productUrls = filterProducts(productUrls, products);
    }

    // Get data
    const data = await getProductData(productUrls, options);

    return data;
}

module.exports = fetchProducts;