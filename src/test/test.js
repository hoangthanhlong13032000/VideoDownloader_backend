const utils = require('../utils');
const fs = require('fs')


const youtube = require('../downloaders/youtube')

// youtube.searchVideoList('long').then(
//     result => {
//         console.log(result.length);
//     }
// )
console.time('a')
let search = "bao+tiền+một+mớ+bình+yên";
search = "bao tiền một mớ bình yên"

youtube.searchVideoRenderer(search).then(
    result => {
        // fs.writeFile("./test.json", JSON.stringify(result), function(err) {
        //     if(err) {
        //         return console.log(err);
        //     }
        //     console.log("The file was saved!");
        // }); 
        console.timeEnd('a')
    }
)