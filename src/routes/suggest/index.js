const axios = require('axios')
const router = require('express').Router();

router.route('/').get(async (req, res) => {
    const search = req.query.search_query;

    let suggestions = [];
    if (search && (typeof search === 'string')) {
        await axios.get('https://suggestqueries-clients6.youtube.com/complete/search', {
            params: {
                client: 'youtube',
                gs_ri: 'youtube',
                ds: 'yt',
                q: search,
            }
        }).then(res => {
            const json = res.data.split(/\(|\)/)[1];
            suggestions = JSON.parse(json)[1].map(res => res[0]);
        }).catch(async (err) => {
            await axios.get('http://suggestqueries.google.com/complete/search', {
                params: {
                    client: 'chrome',
                    gs_ri: 'chrome',
                    ds: 'yt',
                    q: search,
                }
            }).then(res => { suggestions = res.data?.[1] || [] })
        })
    }
    res.status(200).send({ status: 1, data: suggestions, message: '' })
});

module.exports = router;