const cheerio = require('cheerio')
const axios = require('axios')
const qs = require('qs')
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

    if (!paths) throw Error(`No video id and user found: ${link}`);

    const user = paths[1] || '@a';
    const id = paths[2]

    return { user, id };
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
    const { user, id } = getVideoIDAndUser(source);
    const options = { headers: utils.getHeaders() };

    console.log(`--START-- get tiktok video id = ${id}, user = ${user}`);

    let video_info = undefined;
    let video_url = undefined;

    const api_url = `${BASE_API_URL}/${user}/${id}`;
    const web_url = `${BASE_HTML_URL}/${user}/video/${id}`;

    await Promise.all([
        utils.getMiniPage(api_url, options).then(
            result => { video_info = JSON.parse(result) }
        ).catch(err => {
            console.log(`Get video info from url = ${api_url} ERROR: \n${err}!`);
            video_info = undefined;
        }),
        getVideoUrl(web_url).then(
            result => { video_url = result }
        ).catch(err => {
            console.log(`Get video url from url = ${web_url} ERROR: \n${err}!`);
            video_url = undefined;
        })
    ])

    if (!video_info || video_info.statusCode !== 0)
        throw Error(`Video id = ${id}, user = ${user} not found!`);
    if (!video_url || !(video_url.watermark || video_url.no_watermark))
        throw Error(`Get download URL of video id = ${id}, user = ${user} error!`);

    console.log(`--SUCCESS-- get tiktok video id = ${id}, user = ${user}`);

    return extract(video_info, video_url);
}

const getVideoUrl = async (url) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'GET',
            url: 'https://ttdownloader.com/'
        }).then((data) => {
            const cookie = data.headers['set-cookie'].join('')
            const $ = cheerio.load(data.data)
            const dataPost = {
                url: url,
                token: $('#token').attr('value')
            }
            axios({
                method: 'POST',
                url: 'https://ttdownloader.com/req/',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    origin: 'https://ttdownloader.com',
                    referer: 'https://ttdownloader.com/',
                    cookie: cookie,
                },
                data: qs.stringify(dataPost)
            }).then(({ data }) => {
                const $ = cheerio.load(data)
                resolve({
                    no_watermark: $('#results-list > div:nth-child(2) > div.download > a')?.attr('href'),
                    watermark: $('#results-list > div:nth-child(3) > div.download > a')?.attr('href'),
                });
            }).catch(e => {
                console.log(e);
                reject({ no_watermark: '', watermark: '' })
            })
        }).catch(e => {
            console.log(e);
            reject({ no_watermark: '', watermark: '' })
        })
    })
}

const validate = {
    URL: (url) => /tiktok\.com\/@.+\/video\/\d+/.test(url),
}

module.exports = { getVideoIDAndUser, getVideoInfo, validate }
