const tiktok = require('../src/downloaders/tiktok')
const youtube = require('../src/downloaders/youtube')
const facebook = require('../src/downloaders/facebook')
const fs = require('fs');
const utils = require('../src/utils');
const puppeteer = require('puppeteer');
const jsdom = require('jsdom')


// fs.readFile('./test.html', 'utf8', function (err, text) {
//   const document = (new jsdom.JSDOM(text)).window.document;
//   console.log(document.getElementById('pageTitle').textContent);

//   let matches;
//       if (matches = text.match(/h2 class="uiHeaderTitle"?[^>]+>(.+?)<\/h2>/)) {
//         result.title = matches[matches.length - 1];
//       } else if (matches = text.match(/title id="pageTitle">(.+?)<\/title>/)) {
//         result.title = matches[matches.length - 1];
//       }
// })

// return;


// const url = 'https://www.tiktok.com/@cheeseinurdream/video/7027810020414737691?is_copy_url=1&is_from_webapp=v1';
// const url = 'https://www.youtube.com/watch?v=MMgPOQ9gJhM&list=PLMTtrljr9MMYaBGId1v84OArRQKczxm4N&index=12';
// const url = 'https://www.facebook.com/100038874561571/videos/255413099097840';
// const url = 'https://www.facebook.com/watch/?v=372929290965450';
const url = "https://www.facebook.com/watch/?v=929610714651858"
facebook.getVideoInfo(url).then((result) => {
  // console.log(result);
  fs.writeFile('./test.json', JSON.stringify(result), function (err) {
    if (err) console.log(err);
    else console.log('Done');
  })
}).catch((err) => {
  console.log(err);
});
// const a = async () => {
//   try {
//     const url = 'https://www.facebook.com/watch/?v=761819274202214';

//     const page = await utils.getFullPage(url);

//     fs.writeFile('./nguyen.html', page, function (err) {
//       if (err) console.log(err);
//       else console.log('Done');
//     })
//   } catch (err) {
//     console.log(err + 'test')
//   }

// };
//  a()