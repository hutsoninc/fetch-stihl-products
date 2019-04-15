# fetch-stihl-products

[![Current npm package version](https://img.shields.io/npm/v/fetch-stihl-products.svg)](https://www.npmjs.com/package/fetch-stihl-products) 

Fetches Stihl product data.

## Installing

`npm install fetch-stihl-products`

## Usage

```js
const fetchStihlProducts = require('fetch-stihl-products');

const data = await fetchStihlProducts();
```

## API

### fetchStihlProducts(skus, [options])

Returns an array of Stihl products and scraped data.

#### skus

Type: `Array`

SKUs to return data for.

#### options

Type: `Object`

##### url

Type: `string`

Default: `https://hutsonmayfield.stihldealer.net`

Stihl dealer URL to fetch from.

##### sitemap

Type: `string`

Default: `sitemap.xml`

Sitemap file to fetch from.

##### headers

Type: `Object`

Headers to pass when fetching.

##### Promise

Type: `function`

Default: `require('bluebird')`

Use a custom `Promise` implementation.

## Related

- [stihl-scraper](https://github.com/hutsoninc/stihl-scraper) - Scrapes with Puppeteer. Slower and much more resource intensive.

## License

MIT © [Hutson Inc](https://www.hutsoninc.com)