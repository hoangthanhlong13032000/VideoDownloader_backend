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
`GET /api/video/youtube?id=`

    http://localhost:3333/api/video/youtube?id=OnD7mi_-Xso
### By url
`POST /api/video/all`

    http://localhost:3333/api/video/all
    body: {"url": "https://youtube.com/watch?v=OnD7mi_-Xso"}
    or {url: "https://youtu.be/OnD7mi_-Xso"}
### Response
    {status: int, data: [], message: ""}
    status: 1 - success, 0 - fail
