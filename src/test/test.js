const axios = require('axios');
const utils = require('../utils')
const api_url = "https://www.tiktok.com/node/share/video/@cheeseinurdream/7027810020414737691"
// utils.getFullPage(api_url).then(
//     result => {
//         console.log(result);
//     }
// ).catch(err => {
//     console.log(`Get video info from url = ${api_url} ERROR: \n${err}!`);
// });

axios.get("https://www.tiktok.com/node/share/video/@cheeseinurdream/7027810020414737691",
    { headers: { 'User-Agent': 'Thunder Client (https://www.thunderclient.io)' } }).then(
        result => {
            console.log(result);
        }
    ).catch(err => {
        console.log(err.response);
        console.log(`Get video info from url = ${api_url} ERROR: \n${err.response}!`);
    });
