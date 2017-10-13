let Xray = require('x-ray');
let x = Xray();
let Handler = require('../handlerStep');
let send = require('../send');

// let data = {
//     site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
//     bodyPath1: '.articleContainer.block-js',
//     bodyPath2: ['p'],
//     imgPath1: '.articleContainer',
//     imgPath2: ['.articleImage img@data-pic4'],
//     group: 1199,
//     dataName: 'elle_news_test'
// };

let url = 'http://www.elle.ru/allarticles/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.place-js', ['.c1.drm a.newsItem__imgBlock@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList)
            }
            reject(error)
        })
    })
}

async function startParser(){
    try{
        let list = await getUrlList();
        let handler = new Handler(list, 'elle');
        let url = await handler.getUrl();
        if(url){
            await send(url, 1199)
        }
        return true
    }catch(e){
        throw e
    }
}
startParser().then(result=>{
    process.exit();
}).catch(e=>{
    console.log(e)
});
// module.exports.startpars = startParser;