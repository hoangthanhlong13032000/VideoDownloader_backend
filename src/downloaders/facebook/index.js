const utils = require('../../utils')
const extract_1 = require('./extract_1.js')
const extract_2 = require('./extract_2.js')

const VIDEO_URL = "https://facebook.com/watch?v=";
const validate = {
    ID: (id) => /^[0-9]+$/.test(id),
    URL: (url) => /(facebook.com\/)/.test(url)
}

const getVideoID = (link) => {
    if (validate.ID(link)) return link;
    if (!validate.URL(link)) throw Error('Not a Facebook domain');

    const url = new URL(link);
    let id = url.searchParams.get('v');
    if (!id) {
        try {
            const entries = url.pathname.split('videos')[1].split('/');
            for (const entry of entries) if (validate.ID(entry)) id = entry;
        } catch (err) {}
    }

    if (!id) throw Error(`No video id found: ${link}`);
    else if (!validate.ID(id)) throw TypeError(`Video ID=${id} is incorrect`);

    return id;
};

const getVideoInfo = async (source) => {

    console.log(`--START-- get facebook video id of url = ${source}`);

    let info = undefined;
    const id = getVideoID(source);

    console.log(`--SUCCESS-- get facebook video id of url = ${source}: id = ${id}`);

    try {
        console.log(`--START-- get facebook video info of id = ${id}`);
        const page = await utils.getFullPage(VIDEO_URL + id);
        try {
            info = extract_1(page);
        } catch (e) {
            console.log(`--FAIL-- ${e.message}`);
            console.log('--START-- Trying to extract "__bbox" ...!');
            info = extract_2(page);
        }
    }
    catch (err) {
        console.log(`--Error-- getting facebook video id = ${id}: ${err.stack}`);
    }
    finally {
        if (!info) throw Error(`Video id = ${id} not found!`);
        else console.log(`--SUCCESS-- get facebook video info of id = ${id}`);
        return info;
    }
}

module.exports = { getVideoID, getVideoInfo, validate }
