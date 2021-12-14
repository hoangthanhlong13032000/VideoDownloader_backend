const constants = require("./constant.json");

const extract = (info) => {
    const format = data(info);

    return {
        status: Number(info.statusCode == 0),
        expiresInSeconds: expires(info),
        videos: format.videos,
        video_only: format.video_only,
        audio_only: format.audio_only,
        details: details(info)
    };
}

const data = (info) => {
    const videos = [];
    const video_only = [];
    const audio_only = [];

    try {
        const video = info.itemInfo.itemStruct.video || {};
        const music = info.itemInfo.itemStruct.music || {};

        if(video.playAddr || video.downloadAddr) videos.push({
            url: video.playAddr || video.downloadAddr,
            mimeType: `video/${video.format}; codec=\"${video.codecType}\"`,
            container: video.format || '',
            quality: video.ratio || video.definition,
            audioQuality: '',
            width: video.width,
            height: video.height

        })

        if(music.playUrl) audio_only.push({
            url: music.playUrl,
            mimeType: '',
            container: 'mp3',
            audioQuality: '',
        })
    } catch (err) { console.log(err); }
    return { videos, video_only, audio_only };
}


const expires = (info) => {
    try {
        const video = info.itemInfo.itemStruct.video;
        const url = video.playAddr || video.downloadAddr;

        return url.split('expire=')[1].split('&')[0] - Math.round(new Date().getTime() / 1000);
    }
    catch (err) { return '0' }
}

const details = (info) => {
    const seoProps = info.seoProps || {};
    const metaParams = seoProps.metaParams || {};
    const itemInfo = info.itemInfo || {};
    const itemStruct = itemInfo.itemStruct || {};
    const video = itemStruct.video || {};
    const stats = itemStruct.stats || {};
    const author = itemStruct.author || {};

    return {
        id: video.id || itemStruct.id || seoProps.pageId || '',
        title: metaParams.title || itemStruct.desc || '',
        lengthInSeconds: video.duration || 0,
        href: metaParams.canonicalHref || '',
        channel: {
            id: author.uniqueId || '',
            title: author.nickname || '',
            url: author.uniqueId ? constants.BASE_URL + `/@${author.uniqueId}` : '',
            avatar: {
                large: author.avatarLarger || '',
                medium: author.avatarMedium || '',
                thumb: author.avatarThumb || ''
            },
        },
        description: metaParams.description || itemStruct.desc || metaParams.title || '',
        thumbnails: ['cover', 'originCover', 'dynamicCover', 'reflowCover']
            .filter(type => video[type])
            .map(type => ({
                url: video[type],
                height: video.height,
                width: video.width,
                desc: type
            })),
        stats: {
            viewCount: stats.playCount || 0,
            likeCount: stats.diggCount || 0,
            shareCount: stats.shareCount || 0,
            commentCount: stats.commentCount || 0,
        }
    };
}

module.exports = extract