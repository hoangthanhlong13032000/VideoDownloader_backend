const utils = require('../../utils')
const extract = require('./extract')
const constant = require('./constant.json')

const validate = {
    ID: (id) => /^[a-zA-Z0-9-_]{11}$/.test(id),
    URL: (url) => /(youtu\.be\/)|(youtube.com\/)/.test(url)
}

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

const getVideoInfo = async (source) => {

    console.log(`--START-- get youtube video id of url = ${source}`);

    let info = undefined;
    const id = getVideoID(source);
    const url = constant.VIDEO_URL + id;
    const options = { headers: utils.getHeaders() };

    console.log(`--SUCCESS-- get youtube video id of url = ${source}: id = ${id}`);

    try {
        console.log(`--START-- get youtube video info of id = ${id}`);
        const page = await utils.getMiniPage(url, options);
        info = await extract.videoInfo(page, options);
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

const searchVideoRenderer = async (search_query = "", url) => {

    console.log(url);
    if (!url) url = search_query && search_query.length && !Array.isArray(search_query)
        ? constant.SEARCH_URL + search_query : constant.BASE_URL;

    console.log(`--START-- get youtube video list: url = [${url}]`)

    const page = await utils.getMiniPage(url);

    const videos = [];
    const videoRenderers = utils.findObjects(page, /\"videoRenderer\":/, '{', '}') || [];

    for (const videoRenderer of videoRenderers) {
        try {
            videos.push(extract.videoRenderer(videoRenderer))
        } catch (err) { console.log(err.message); }
    }

    console.log(`--SUCCESS-- get youtube video list: total ${videos.length} videos!`);
    return videos;
}

module.exports = { getVideoID, getVideoInfo, searchVideoRenderer, validate, constant }
