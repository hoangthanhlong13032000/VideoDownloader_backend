const utils = require('../../utils')
const extract = require('./extract')

/**
 * Get video ID.
 *
 * @param {string} link
 * @return {string}
 * @throws {Error} If unable to find a id
 * @throws {TypeError} If id doesn't match specs
 */
const getVideoID = (link) => {
    if (validate.ID(link)) return link;
    if (!validate.URL(link)) throw Error('Not a YouTube domain');

    const url = new URL(link);
    let id = url.searchParams.get('v');
    if (!id) {
        const paths = url.pathname.split('/');
        id = url.host === 'youtu.be' ? paths[1] : paths[2];
    }

    if (!id) throw Error(`No video id found: ${link}`);
    else {
        id = id.substring(0, 11);
        if (!validate.ID(id)) throw TypeError(`Video ID=${id} is incorrect`);
    }

    return id;
};

/**
 * Get video Info.
 *
 * @param {string} source id or url of video
 * @return {string}
 * @throws {Error} If unable to find a id
 * @throws {TypeError} If id doesn't match specs
 */

const BASE_URL = "https://www.youtube.com/watch?v=";
const getVideoInfo = async (source) => {
    
    console.log(`--START-- get youtube video id of url = ${source}`);

    let info = undefined;
    const id = getVideoID(source);
    const url = BASE_URL + id;
    const options = { headers: utils.getHeaders() };

    console.log(`--SUCCESS-- get youtube video id of url = ${source}: id = ${id}`);

    try {
        console.log(`--START-- get youtube video info of id = ${id}`);
        const page = await utils.getMiniPage(url, options);
        info = await extract(page, options);
    } 
    catch (err) {
        console.log(`--Error-- getting youtube video id = ${id}: ${err.message}`);
    } 
    finally {
        if (!info) throw Error(`Video id = ${id} not found!`);
        else console.log(`--SUCCESS-- get youtube video info of id = ${id}`);
        return info;
    }
}

const validate = {
    ID: (id) => /^[a-zA-Z0-9-_]{11}$/.test(id),
    URL: (url) => /(youtu\.be\/)|(youtube.com\/)/.test(url)
}


module.exports = { getVideoID, getVideoInfo, validate }
