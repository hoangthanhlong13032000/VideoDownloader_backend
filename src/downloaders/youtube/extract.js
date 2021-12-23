const signature_cipher = require('./signature-cipher');
const constants = require("./constant.json");
const utils = require("../../utils");

const videoInfo = async (source, options) => {

    const INFO_VAR = "ytInitialPlayerResponse";
    const INFO_ATTR = ["playabilityStatus", "streamingData", "videoDetails", "microformat"];

    try {
        const info = {};

        // const regex = new RegExp(`\\b${INFO_VAR}\\s*=\\s*{`, 'i');
        // let json = source.slice(source.search(regex))
        // json = json.slice(json.search('{'), json.search('};') + 1);

        // const object = JSON.parse(json);

        let object = utils.findObjects(source, /var ytInitialPlayerResponse = /, "{", "}")[0];

        for (const attr of INFO_ATTR) info[attr] = object[attr] ? object[attr] : {};

        await signature_cipher.decipherFormats(info.streamingData, source, options);

        const format = data(info);
        return {
            status: Number(info?.playabilityStatus?.status == 'OK'),
            videos: format.videos,
            video_only: format.video_only,
            audio_only: format.audio_only,
            recommends: recommends(source),
            details: details(info)
        };
    } catch (e) {
        throw Error(`Error when extract youtube html page: ${e}`);
    }
}
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
const details = (info) => {
    const videoDetails = info.videoDetails || {};
    const microformat = info.microformat?.playerMicroformatRenderer || {};

    const video_id = videoDetails.videoId || '';
    const video_url = video_id ? constants.VIDEO_URL + video_id : '';

    const channel_id = videoDetails.channelId || microformat.externalChannelId || '';
    const channel_url = channel_id ? constants.CHANNEL_URL + '/' + channel_id : '';

    return {
        id: video_id,
        source: 'youtube',
        title: videoDetails.title || microformat.title?.simpleText || '',
        lengthInSeconds: videoDetails.lengthSeconds || microformat.lengthSeconds || '0',
        href: video_url,
        channel: {
            id: channel_id,
            title: videoDetails.author || microformat.ownerChannelName || '',
            url: channel_url,
            avatar: {},
        },
        description: videoDetails.shortDescription || microformat.description?.simpleText || '',
        thumbnails: videoDetails.thumbnail?.thumbnails || microformat.thumbnail?.thumbnails || [],
        stats: {
            viewCount: videoDetails.viewCount || microformat.viewCount || 0,
            likeCount: 0,
            shareCount: 0,
            commentCount: 0,
        }
    };
}
const recommends = (source) => {
    const videos = [];
    const videoRenderers = utils.findObjects(source, /\"compactVideoRenderer\":/, '{', '}') || [];
    for (const vr of videoRenderers) {
        try { videos.push(videoRenderer(vr)) }
        catch (err) { console.log(err.message); }
    }
    return videos;
}


const videoRenderer = (renderer) => {
    const video_id = renderer?.videoId;
    if (!renderer || !video_id) throw Error(`Cant not extract videoRenderer id = ${video_id}`);
    const video_title = getRunsText(renderer.title?.runs) || renderer.title?.simpleText || "";
    const video_description = getRunsText(renderer.detailedMetadataSnippets?.[0]?.snippetText?.runs || renderer.descriptionSnippet?.runs) || video_title || "";

    const channel = (renderer.ownerText || renderer.longBylineText)?.runs?.[0];
    const channel_title = channel.text || "";
    const channel_path = channel.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url || "";
    const channel_id = channel_path.split('channel/')[1] || "";
    const channel_thumbnails = renderer.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails || renderer.channelThumbnail?.thumbnails || [];

    return {
        id: video_id,
        lengthInText: renderer.lengthText?.simpleText,
        title: video_title,
        publishedTime: renderer.publishedTimeText?.simpleText || "",
        href: constants.VIDEO_URL + video_id,
        thumbnails: renderer.thumbnail?.thumbnails || [],
        channel: {
            id: channel_id,
            title: channel_title,
            url: constants.BASE_URL + channel_path,
            avatar: {
                thumb: channel_thumbnails?.[0]?.url || ""
            },
        },
        description: video_description,
        stats: {
            viewCount: renderer.viewCountText?.simpleText,
        }
    }
}

const getRunsText = (runs) => {
    let text = "";
    if (Array.isArray(runs)) runs.forEach(run => text += run.text || "");
    return text;
}

module.exports = { videoInfo, videoRenderer }