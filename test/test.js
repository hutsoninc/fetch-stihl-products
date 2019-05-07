const fetchStihl = require('../');

test('Fetches all Stihl product data', async done => {
    let data;
    try {
        data = await fetchStihl();
    } catch (err) {
        console.error(err);
    }
    expect(data).toBeDefined();
    done();
}, 120000);
