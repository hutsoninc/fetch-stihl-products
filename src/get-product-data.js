const { JSDOM } = require('jsdom');
const fetch = require('fetch-retry');
const he = require('he');

async function getProductData(productUrls, options) {
    let { url, encodeEntities, headers, Promise } = options;
    let promises = productUrls.map(async productUrl => {
        let html = await fetch(productUrl, {
            method: 'GET',
            headers
        }).then(res => res.text());

        let dom = new JSDOM(html);
        let window = dom.window;
        let { document } = window;

        // Product title
        let title = document.querySelector('#productNameContainer span[itemprop=name]').textContent;

        // Product SKU and categories
        let splitUrl = productUrl.split('/').filter(s => s);
        let sku = splitUrl.pop().toLowerCase();
        let subcategory = splitUrl.pop().toLowerCase();
        let category = splitUrl.pop().toLowerCase().toLowerCase();

        // Product description
        let description = document.querySelector('#read-more .modal-body').textContent || '';
        description = description.replace(/\s\s+/g, ' ').trim();

        // Product images
        let images = [];
        document.querySelectorAll('#additional-images img').forEach(el => {
            let src = el.src;
            src = src.split('?')[0];
            images.push(url.slice(0, -1) + src);
        });

        if (images.length === 0) {
            let src = document.querySelectorAll('#product-thumb-container img')[0].src;
            src = src.split('?')[0];
            images.push(url.slice(0, -1) + src);
        }

        // Product variations
        let variations = [];
        let reservationEl = document.querySelector('#Reservation');
        let attributeListEl = reservationEl.querySelector('#AttributeList');
        if (attributeListEl) {
            let options = attributeListEl.querySelectorAll('option');
            if (options && options.length > 0) {
                options.forEach(el => {
                    let text = el.innerHTML;
                    if (text) {
                        variations.push({
                            text: text.replace(/\s\s+/g, '').trim(),
                            value: Number(el.value),
                        });
                    }
                });
            }
        }
        if (variations.length === 0) {
            // Product price
            let price = document.querySelector('.price');
            if (price) {
                price = Number(price.textContent.replace(/[\$,]/g, ''));
                if (price === 0) {
                    price = null;
                }
            } else {
                price = null;
            }

            // Product variation
            let strongEls = reservationEl.querySelectorAll('strong');
            if (strongEls && strongEls.length > 0) {
                let text;
                strongEls.forEach(el => {
                    let lowerText = el.textContent.toLowerCase();
                    if (lowerText.indexOf('dsrp') >= 0 || lowerText.indexOf('quantity') >= 0) {
                        return;
                    }
                    if (!text) {
                        text = el.textContent;
                    }
                });
                variations.push({
                    text: text || '',
                    value: price,
                });
            }
        }

        // Product specs
        let specs = [];
        document.querySelectorAll('table.specs-table-tab tbody tr').forEach(el => {
            let spec = {};
            el.querySelectorAll('td').forEach((el, i) => {
                let text = el.textContent;
                if (i === 0) {
                    spec.property = text.trim();
                } else {
                    spec.data = text.trim();
                }
            })
            specs.push(spec);
        });

        // Product features
        let features = [];
        document.querySelectorAll('#features .feature').forEach(el => {
            let descriptionEl = el.querySelector('.description');
            let title = descriptionEl.querySelector('b') || descriptionEl.querySelector('strong');
            if (title) {
                title = title.textContent;
                if (title.toLowerCase().indexOf('common features') >= 0) {
                    return;
                }
            } else {
                return;
            }
            let text = '';
            descriptionEl.childNodes.forEach(el => {
                if (el.textContent !== title) {
                    text += el.textContent;
                }
            });
            text = text.replace(/\s\s+/g, '');
            let image = '';
            el.querySelectorAll('img').forEach(el => {
                let alt = el.getAttribute('alt');
                if (!alt || alt.toLowerCase() !== 'zoom') {
                    let src = el.getAttribute('data-original').split('?')[0];
                    image = url.slice(0, -1) + src;
                }
            })
            features.push({
                title,
                text,
                image,
            });
        });

        // Aggregate rating
        let aggregateRating = {};
        let aggregateRatingEl = document.querySelector('[itemprop=aggregateRating]');
        if (aggregateRatingEl) {
            aggregateRating.ratingValue = aggregateRatingEl.querySelector('[itemprop=ratingValue]').textContent;
            aggregateRating.bestRating = aggregateRatingEl.querySelector('[itemprop=bestRating]').textContent;
            aggregateRating.reviewCount = aggregateRatingEl.querySelector('[itemprop=reviewCount]').textContent;
        }

        if (encodeEntities) {
            title = encode(title);
            description = encode(description);
            specs = specs.map(obj => {
                obj.property = encode(obj.property);
                obj.data = encode(obj.data);
                return obj;
            });
            features = features.map(obj => {
                obj.title = encode(obj.title);
                obj.text = encode(obj.text);
                return obj;
            });
        }

        return {
            title,
            variations,
            sku,
            category,
            subcategory,
            description,
            images,
            specs,
            features,
            aggregateRating,
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