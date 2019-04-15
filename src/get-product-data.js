const cheerio = require('cheerio');
const fetch = require('fetch-retry');
const he = require('he');

async function getProductData(productUrls, options) {
    let { url, headers, Promise } = options;
    let promises = productUrls.map(async productUrl => {
        let html = await fetch(productUrl, {
            method: 'GET',
            headers
        });
        html = await html.text();

        const $ = cheerio.load(html);

        // Product title
        let title = $('#productNameContainer span[itemprop=name]').text();
        title = encode(title);

        // Product SKU
        let sku = productUrl.split('/').filter(s => s);
        sku = sku[sku.length - 1];

        // Product description
        let description = $('#read-more .modal-body').text() || '';
        description = description.replace(/\s\s+/g, ' ').trim();
        description = encode(description);

        // Product images
        let images = [];
        $('#additional-images img').map((i, e) => {
            let src = e.attribs.src;
            src = src.split('?')[0];
            images.push(url.slice(0, -1) + src);
        });

        // Product price
        let price = $('#product-price').text();
        price = Number(price.replace(/\$/g, ''));

        // Product specs
        let specs = [];
        $('table.specs-table-tab tbody tr').map((i, el) => {
            el = cheerio.load(el);
            let spec = {};
            el('td').map((i, e) => {
                let text = cheerio.load(e).text();
                if (i === 0) {
                    spec.property = encode(text);
                } else {
                    spec.data = encode(text);
                }
            });
            specs.push(spec);
        });

        return {
            title,
            sku,
            description,
            images,
            price,
            specs,
            url: productUrl,
        };
    });
    return await Promise.all(promises);
}

function encode(str) {
    return he.encode(str, {
        useNamedReferences: true,
    });
}

module.exports = getProductData;