let Parser = require('../universalParser');
let Xray = require('x-ray');
let x = Xray();
let db = require('../models');
let start = require('../parser').start;
let data = {
    site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
    bodyPath1: '.articleContainer.block-js',
    bodyPath2: ['p'],
    imgPath1: '.articleContainer',
    imgPath2: ['.articleImage img@data-pic4'],
    group: 1199,
    dataName: 'elle_news_test'
};

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
    data.urlList = await getUrlList();
    return start(data);
}
startParser()
// module.exports.startpars = startParser;