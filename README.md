# VideoDownloader_backend
A web app to download video from youtube, facebook, ...
# File
- Config file : `.env` : config environment variables (port, database, ...) ...

# Environment Variable:
```PG_DATABASE_URL=postgres://postgres:${db_password}@${db_host}:${db_port}/postgres?sslmode=disable```

- Main file: `app.js` :
# Run
    node app.js

# Search video list 

`GET /api/video/search/youtube?search_query={text}`

    http://localhost:3333/api/search/youtube?search_query=test

    http://localhost:3333/api/search/youtube?from={index}&to={index}

    http://localhost:3333/api/search/youtube/trending?from={index}&to={index}

    http://localhost:3333/api/search/youtube/music?from={index}&to={index}

    http://localhost:3333/api/search/youtube/movie?from={index}&to={index}

    http://localhost:3333/api/search/youtube/gaming?from={index}&to={index}

- search_query is not required
- from, to are not required

# Autocomplete video search
`GET /api/suggest?search_query={text}`
    
    http://localhost:3333/api/suggest?search_query=faded

# Get video information 

## By video ID
`GET /api/video/youtube?id={id}`

`GET /api/video/tiktok?id={id}&user={user}`
- user is not required

`GET /api/video/facebook?id={id}`

`GET /api/video/facebook?id={id}`

    http://localhost:3333/api/video/youtube?id=9X-heUObD14

    http://localhost:3333/api/video/tiktok?id=7027810020414737691&user=@cheeseinurdream

    http://localhost:3333/api/video/facebook?id=929610714651858

## By url
`POST /api/video/all`

    http://localhost:3333/api/video/all

    body: {"url": "https://youtube.com/watch?v=9X-heUObD14"}

    body: {"url": "https://www.tiktok.com/@cheeseinurdream/video/7027810020414737691"}

    body: {"url": "https://www.facebook.com/watch/?v=929610714651858"}

### Response
    // status: 1 - success, 0 - fail
    {
        "status": 1,
        "message": "",
        "data": {
            "status": 1,
            "videos": [
                {
                    "url": "",
                    "mimeType": "audi",
                    "container": "mp4",
                    "quality": "720p",
                    "audioQuality": "128kbps",
                    "width": 0,
                    "height": 0
                }, {...}, {...}
            ],
            "video_only": [
                {
                    "url": "",
                    "mimeType": "",
                    "container": "",
                    "quality": "",
                    "width": 0,
                    "height": 0
                }, {...}, {...}
            ],
            "audio_only": [
                {
                    "url": "",
                    "mimeType": "",
                    "container": "",
                    "audioQuality": ""
                }, {...}, {...}
            ],
            "recommends": [],
            "details": {
                "id": "",
                "source": "",
                "title": "",
                "lengthInSeconds": 0,
                "href": "",
                "channel": {
                    "id": "",
                    "title": "",
                    "url": "",
                    "avatar": {
                        "large": "",
                        "medium": "",
                        "thumb": ""
                    }
                }
                "description": "",
                "thumbnails": [
                    {
                    "url": "",
                    "height": 0,
                    "width": 0,
                    "desc": ""
                    }, {...}, {...}
                ],
                "stats": {
                    "viewCount": 0,
                    "likeCount": 0,
                    "shareCount": 0,
                    "commentCount": 0
                }
            },
        },
    }


# Save, get, delete videos

Note: These following APIs need Authorization header

## Save video

`POST /auth/video`

Body:
```
{
    "source": "youtube",
    "id": "G-17jRBVdQi",
    "title": "title for video",
    "description": "description for video",
    "thumbnail": "http://thumbnail-url.com"
}
```

## Get all saved videos
`GET /auth/video`

## Delete video
`DELETE /auth/video`

Body: 
```
{
    "source": "tiktok",
    "id": "G-17jRBVdQi",
}
```
