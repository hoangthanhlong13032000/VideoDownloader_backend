# VideoDownloader_backend
A web app to download video from youtube, facebook, ...
# File
- Config file : `.env` : config environment variables (port, database, ...) ...

- Main file: `app.js` :
# Run
    node app.js
# Api

## Get video information 

### By id
`GET /api/video/youtube?id={id}`

`GET /api/video/tiktok?id={id}&user={user}`

`GET /api/video/facebook?id={id}`

    http://localhost:3333/api/video/youtube?id=OnD7mi_-Xso

    http://localhost:3333/api/video/tiktok?id=7027810020414737691&user=@cheeseinurdream

    http://localhost:3333/api/video/facebook?id=929610714651858

### By url
`POST /api/video/all`

    http://localhost:3333/api/video/all

    body: {"url": "https://youtube.com/watch?v=OnD7mi_-Xso"}

    body: {"url": "https://www.tiktok.com/@cheeseinurdream/video/7027810020414737691"}

    body: {"url": "https://www.facebook.com/watch/?v=929610714651858"}

### Response
    {status: int, data: [], message: ""}
    status: 1 - success, 0 - fail
