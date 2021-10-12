const ytdl = require('../src/downloaders/test')
const info = require('../src/downloaders/test/info')

// ytdl.getInfo('https://www.youtube.com/watch?v=DRuwEcFBkew', {}).then(
//     res => {
//         // console.log(res)
//     }
// )
// // info.getVideoInfoPage('DRuwEcFBkew', {}).then(
//     res => {
//         console.log(res)
//     }
// ).catch(e => {
//     console.log(e.toString())})

const miniget = require('miniget')

console.log(miniget.defaultOptions)