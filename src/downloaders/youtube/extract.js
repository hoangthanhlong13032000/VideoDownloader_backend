const signature_cipher = require('./signature-cipher');
const constants = require("./constant.json");


/**
 * get a variable from string.
 *
 * @param {string} name
 * @param {string} source
 * @param {Object} options
 * @return {Object}
 */

const INFO_VAR = "ytInitialPlayerResponse";
const INFO_ATTR = ["playabilityStatus", "streamingData", "videoDetails", "microformat"];

const extract = async (source, options) => {
    try {
        const info = {};

        const regex = new RegExp(`\\b${INFO_VAR}\\s*=\\s*{`, 'i');
        let json = source.slice(source.search(regex))
        json = json.slice(json.search('{'), json.search('};') + 1);

        const object = JSON.parse(json);

        for (const attr of INFO_ATTR) info[attr] = object[attr] ? object[attr] : {};

        await signature_cipher.decipherFormats(info.streamingData, source, options);

        const format = data(info);
        return {
            status: status(info),
            expiresInSeconds: expires(info),
            videos: format.videos,
            video_only: format.video_only,
            audio_only: format.audio_only,
            details: details(info)
        };
    } catch (e) {
        throw Error(`Error when extract youtube html page: ${e}`);
    }
}

/**
 * @param {Object} format
 * @returns {Object}
 */

const data = (info) => {
    const videos = [];
    const video_only = [];
    const audio_only = [];

    try {
        const streamingData = info.streamingData;
        for (const fm of [...streamingData.formats, ...streamingData.adaptiveFormats]) {
            Object.assign(fm, constants.FORMATS[fm.itag]);

            hasVideo = !!fm.qualityLabel;
            hasAudio = !!fm.audioBitrate;

            const format = {
                url: fm.url,
                mimeType: fm.mimeType || '',
                container: fm.mimeType ? fm.mimeType.split(';')[0].split('/')[1] : '',
            }
            if (hasVideo && hasAudio) {
                videos.push(Object.assign(format, {
                    quality: fm.qualityLabel,
                    audioQuality: fm.audioBitrate + 'kbps',
                    width: fm.width,
                    height: fm.height
                }))
            } else if (hasVideo) {
                video_only.push(Object.assign(format, {
                    quality: fm.qualityLabel,
                    width: fm.width,
                    height: fm.height
                }))
            } else if (hasAudio) {
                audio_only.push(Object.assign(format, {
                    audioQuality: fm.audioBitrate + 'kbps',
                }))
            }
        }
    } catch (err) { console.log(err); }
    return { videos, video_only, audio_only };
}

const status = (info) => {
    try { return Number(info.playabilityStatus.status == 'OK') }
    catch (err) { return 0 }
}
const expires = (info) => {
    try { return info.streamingData.expiresInSeconds }
    catch (err) { return '0' }
}

const details = (info) => {
    const videoDetails = info.videoDetails;
    const microformat = info.microformat ? info.microformat.playerMicroformatRenderer || {} : {};

    return {
        id: videoDetails.videoId || '',
        title: title(videoDetails, microformat),
        lengthInSeconds: length(videoDetails, microformat),
        href: constants.BASE_URL + videoDetails.videoId,
        channel: channel(videoDetails, microformat),
        description: description(videoDetails, microformat),
        thumbnails: thumbnails(videoDetails, microformat),
        stats: {
            viewCount: viewCount(videoDetails, microformat),
            likeCount: 0,
            shareCount: 0,
            commentCount: 0,
        }
    };
}

const title = (videoDetails, microformat) => {
    try { return videoDetails.title || microformat.title.simpleText || '' }
    catch (err) { return '' }
}
const length = (videoDetails, microformat) => {
    try { return videoDetails.lengthSeconds || microformat.lengthSeconds || '0' }
    catch (err) { return '0' }
}
const channel = (videoDetails, microformat) => {
    try {
        const id = videoDetails.channelId || microformat.externalChannelId || '';
        return {
            id: id,
            title: videoDetails.author || microformat.ownerChannelName || '',
            url: constants.CHANNEL_URL + `/${id}`,
            avatar: {},
        }
    }
    catch (err) { return { id: '', title: '', url: '', avatar: {}} }
}
const description = (videoDetails, microformat) => {
    try { return videoDetails.shortDescription || microformat.description.simpleText || '' }
    catch (err) { return '' }
}
const thumbnails = (videoDetails, microformat) => {
    try {
        const thumbnail = videoDetails.thumbnail || microformat.thumbnail;
        return thumbnail.thumbnails || []
    }
    catch (err) { return [] }
}
const viewCount = (videoDetails, microformat) => {
    try {
        return videoDetails.viewCount || microformat.viewCount || '0'
    }
    catch (err) { return '0' }
}
module.exports = extract