const validate = require('./validate')

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
    if (validate.URL(link)) throw Error('Not a YouTube domain');

    const url = new URL(link);
    let id = url.searchParams.get('v');
    if (!id) {
        const paths = url.pathname.split('/');
        id = url.host === 'youtu.be' ? paths[1] : paths[2];
    }

    if (!id) throw Error(`No video id found: ${link}`);
    else {
        id = id.substring(0, 11);
        if (validate.ID(id)) throw TypeError(`Video ID is incorrect`);
    }

    return id;
};

/**
 * Get video Info.
 *
 * @param {string} string id or url of video
 * @return {string}
 * @throws {Error} If unable to find a id
 * @throws {TypeError} If id doesn't match specs
 */
const BASE_URL = 'https://www.youtube.com/watch?v=';

const getVideoInfo = (string) => {
    const id = validate.ID(string) ? string : getVideoID(string);


}

module.exports = {getVideoID}
