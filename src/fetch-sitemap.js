const fetch = require('fetch-retry');
const xml2js = require('xml2js');

async function fetchSitemap(options) {
    let { url, headers, sitemap } = options;
    let data;
    try {
        data = await fetch(`${url}${sitemap}`, {
            method: 'GET',
            headers
        });
        data = await data.text();
        data = await parseString(data);
        data = getUrls(data);
    } catch (err) {
        console.error(err);
    }
    return data;
}

function parseString(str) {
    return new Promise((resolve, reject) => {
        xml2js.parseString(str, (err, res) => {
            if (err) reject(err);
            resolve(res);
        });
    });
}

function getUrls(data) {
    let arr = [];
    for (let i = 0, len = data.urlset.url.length; i < len; i++) {
        let url = data.urlset.url[i].loc[0];
        if (!/\/$/.test(url)) {
            url += '/';
        }
        arr.push(url);
    }
    return arr;
}

module.exports = fetchSitemap;