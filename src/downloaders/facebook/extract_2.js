const utils = require('../../utils/index')


const extract = (page) => {
    // new video page format:
    // example: https://www.facebook.com/100038874561571/videos/255413099097840
    try {
        const videoData = media(page);
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
        throw Error(`Error when extract youtube html page: ${e}`);
    }
}

const media = (page) => {
    for (const __bbox of utils.findObjects(page, /"__bbox":/, '{', '}')) {
        try {
            const media = __bbox.result.data.video.story.attachments[0].media;
            const extensions = __bbox.result.extensions;
            return Object.assign(media, extensions)
        }
        catch (err) { }
    }

    return {}
}

const data = (videoData) => {
    const videos = [];
    if (videoData.playable_url) videos.push({
            url: videoData.playable_url,
            mimeType: '',
            container: container(videoData.playable_url),
            quality: 'SD',
            audioQuality: '128kbps',
            width: '',
            height: ''
        }
    )
    if (videoData.playable_url_quality_hd) videos.push({
            url: videoData.playable_url_quality_hd,
            mimeType: '',
            container: container(videoData.playable_url_quality_hd),
            quality: 'HD',
            audioQuality: '128kbps',
            width: videoData.original_width,
            height: videoData.original_height
        }
    )
    const video_only = [];
    const audio_only = [];

    const all_video_dash_prefetch_representations = videoData.all_video_dash_prefetch_representations || [];
    for (const avdpr of all_video_dash_prefetch_representations) {
        if (videoData.id != avdpr.video_id && videoData.videoId != avdpr.video_id) continue;
        for (const repr of avdpr.representations || []) {
            if (repr.mime_type.indexOf('video') != -1) {
                video_only.push({
                    url: repr.base_url,
                    mimeType: `${repr.mime_type}; codec=\"${repr.codecs}\"`,
                    container: container(repr.base_url, repr.mime_type),
                    quality: Math.min(repr.width, repr.height) + 'p',
                    width: repr.width,
                    height: repr.height
                });
            } else if (repr.mime_type.indexOf('audio') != -1) {
                audio_only.push({
                    url: repr.base_url,
                    mimeType: `${repr.mime_type}; codec=\"${repr.codecs}\"`,
                    container: container(repr.base_url, repr.mime_type),
                    audioQuality: '128kbps',
                });
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

    const details = {
        id: videoData.videoId || videoData.id || '',
        source: 'facebook',
        title: page_info.articleBody.split('\n')[0],
        lengthInSeconds: Math.round((videoData.playable_duration_in_ms || 0) / 1000),
        href: page_info.url || videoData.permalink_url || '',
        channel: {
            id: page_info.author.identifier || videoData.owner.id || '',
            title: page_info.author.name || '',
            url: page_info.author.url || '',
            avatar: {},
        },
        description: page_info.articleBody,
        thumbnails: [],
        stats: {
            viewCount: 0,
            likeCount: 0,
            shareCount: 0,
            commentCount: 0,
        }
    }

    for (const ins of page_info.interactionStatistic) {
        const userInteractionCount = ins.userInteractionCount || 0;
        if (/comment/i.test(ins.interactionType)) details.stats.commentCount = userInteractionCount
        else if (/like/i.test(ins.interactionType)) details.stats.likeCount = userInteractionCount;
        else if (/share/i.test(ins.interactionType)) details.stats.shareCount = userInteractionCount;
    }

    try {
        details.thumbnails = [{
            url: videoData.preferred_thumbnail.image.uri,
            height: '',
            width: '',
            desc: 'originCover'
        }]
    } catch (err) { details.thumbnails = [] }

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