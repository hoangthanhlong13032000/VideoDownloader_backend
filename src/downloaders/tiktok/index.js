const utils = require('../../utils')
const extract = require('./extract')
const CONSTANT = require('./constant.json')

/**
 * Get video ID and video User.
 *
 * @param {string} link of video
 * @return {object} user: video'user, id: video'id
 * @throws {Error} If unable to find a id
 * @throws {TypeError} If id doesn't match specs
 */
const getVideoIDAndUser = (link) => {
    if (!validate.URL(link)) throw Error(`Not a Tiktok domain: url = ${link}`);

    const url = new URL(link);

    const paths = /(@[\w.-]+)\/video\/(\d+)/.exec(url.pathname);

    if(!paths) throw Error(`No video id and user found: ${link}`);

    const user = paths[1];
    const id = paths[2]

    return {user, id};
};

/**
 * Get video Info.
 *
 * @param {string} source id or url of video
 * @return {string}
 * @throws {Error} If unable to find a id
 * @throws {TypeError} If id doesn't match specs
 */

const BASE_API_URL = CONSTANT.BASE_API_URL;
const BASE_HTML_URL = CONSTANT.BASE_URL;

const getVideoInfo = async (source) => {
    const {user, id} = getVideoIDAndUser(source);
    const options = {headers: utils.getHeaders()};

    console.log(`--START-- get tiktok video id = ${id}, user = ${user}`);

    let info = undefined;

    try {
        const url = `${BASE_API_URL}/${user}/${id}`;
        const json = await utils.getMiniPage(url, options);
        const object = JSON.parse(json);
        if (object.statusCode === 0) info = object;
    } catch (err) {
        console.log(`Get video info from url = ${source} ERROR: \n${err}!`);
    }

    if(!info) throw Error(`Video id = ${id}, user = ${user} not found!`);
    else console.log(`--SUCCESS-- get tiktok video id = ${id}, user = ${user}`);

    return extract(info);
}

const validate = {
    URL: (url) =>  /tiktok\.com\/@.+\/video\/\d+/.test(url),
}

module.exports = {getVideoIDAndUser, getVideoInfo, validate}
