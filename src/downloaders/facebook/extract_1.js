const utils = require('../../utils/index');
const jsdom = require("jsdom");

const extract = (page) => {
    // old video page format:
    // example: https://www.facebook.com/SharkTankVietNam/videos/372929290965450/
    try {
        const videoData = utils.findObjects(page, /videoData:/, '[', ']')[0] || [];
        if (!videoData.length) throw Error('Fail to extract \"videoData\"')

        const format = data(videoData);
        const details = videoDetails(page, videoData);

        return {
            status: Number(format.videos.length > 0),
            videos: format.videos,
            video_only: format.video_only,
            audio_only: format.audio_only,
            recommends: [],
            details: details
        };
    } catch (e) {
        throw Error(`Fail to extract html page type 1: ${e.message}`);
    }
}

const data = (videoData) => {
    const videos = [];
    const audio_only = [];
    const video_only = [];

    for (const vd of videoData) {
        if (vd.sd_src_no_ratelimit || vd.sd_src) videos.push({
            url: vd.sd_src_no_ratelimit || vd.sd_src,
            mimeType: '',
            container: container(vd.sd_src_no_ratelimit || vd.sd_src),
            quality: 'SD',
            audioQuality: '128kbps',
            width: '',
            height: ''
        })
        if (vd.hd_src_no_ratelimit || vd.hd_src) videos.push({
            url: vd.hd_src_no_ratelimit || vd.hd_src,
            mimeType: '',
            container: container(vd.hd_src_no_ratelimit || vd.sd_src),
            quality: 'HD',
            audioQuality: '128kbps',
            width: vd.original_width,
            height: vd.original_height
        })

        const document = (new jsdom.JSDOM(vd.dash_manifest)).window.document;
        for (const repr of document.querySelectorAll("Representation")) {
            const format = { mimetype: '', codecs: '', width: '', height: '', fbqualitylabel: '' };
            const baseurl = repr.querySelector('BASEURL').textContent;
            if (baseurl) {
                for (const key in format) if (repr.getAttribute(key)) format[key] = repr.getAttribute(key);
                if (format.mimetype.indexOf('video') != -1) video_only.push({
                    url: baseurl,
                    mimeType: `${format.mimetype}; codec=\"${format.codecs}\"`,
                    container: container(baseurl, format.mimetype),
                    quality: format.fbqualitylabel,
                    width: format.width,
                    height: format.height
                });
                else if (format.mimetype.indexOf('audio') != -1) {
                    audio_only.push({
                        url: baseurl,
                        mimeType: `${format.mimetype}; codec=\"${format.codecs}\"`,
                        container: container(baseurl, format.mimetype),
                        audioQuality: '128kbps',
                    });
                }
            }
        }
    }

    return { videos: videos, video_only: video_only, audio_only: audio_only }
}

const videoDetails = (page, videoData) => {
    const page_info = {
        articleBody: '',
        url: '',
        interactionStatistic: [],
        author: {}
    };
    utils.findObjects(page, /\<script type\=\"application\/ld\+json\" nonce=\"[^\"]*\"\>/, '{', '}').forEach(obj => {
        for (const key in page_info) if (obj[key]) page_info[key] = obj[key]
    });
    if (!page_info.articleBody) page_info.articleBody = utils.findStrings(page, /<title id="pageTitle">/, "<")[0] || '';


    const stats = {
        viewCount: 0,
        likeCount: 0,
        shareCount: 0,
        commentCount: 0,
    };
    for (const ins of page_info.interactionStatistic) {
        const userInteractionCount = ins.userInteractionCount || 0;
        if (/comment/i.test(ins.interactionType)) stats.commentCount = userInteractionCount
        else if (/like/i.test(ins.interactionType)) stats.likeCount = userInteractionCount;
        else if (/share/i.test(ins.interactionType)) stats.shareCount = userInteractionCount;
    }



    const details = {
        id: '',
        title: page_info.articleBody.split('\n')[0],
        lengthInSeconds: 0,
        href: page_info.url,
        channel: {
            id: page_info.author.identifier || '',
            title: page_info.author.name || '',
            url: page_info.author.url || '',
            avatar: {},
        },
        description: page_info.articleBody,
        thumbnails: [],
        stats: stats
    }

    let original_height = '';
    let original_width = '';
    for (const vd of videoData) {
        if (vd.video_id) details.id = vd.video_id;
        if (vd.video_url) details.href = vd.video_url;
        if (vd.original_height) original_height = vd.original_height;
        if (vd.original_width) original_width = vd.original_width;
    }

    const thumbnail = utils.findStrings(page, /afterTheAdBreakImage:"/, '"')[0] || '';
    if (thumbnail) details.thumbnails = [{ url: thumbnail, height: original_height, width: original_width, desc: 'originCover' }]

    return details;
}

const container = (url, mime_codec) => {
    if (mime_codec) try {
        return mime_codec.split(';')[0].split('/')[1] || '';
    } catch (err) { }
    try {
        pathname = new URL(url).pathname;
        const index = pathname.lastIndexOf('.');
        if (index > 0) return pathname.slice(index + 1);
    } catch (e) { }
    return '';
}
module.exports = extract