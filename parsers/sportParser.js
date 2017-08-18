let Parser = require('../universalParser');
let start = require('../parser').start;
let Xray = require('x-ray');
let x = Xray();
let data = {
    site: 'https://www.sports.ru/tribuna/blogs/thesteal/1368410.html',
    bodyPath1: 'article',
    bodyPath2: ['.material-item__content p'],
    imgPath1: 'article',
    imgPath2: ['.material-item__content img@src'],
    group: 1196,
    dataName: 'sport_news_test'
};

let url = 'https://www.sports.ru/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.columns-layout__main', ['article h2 a@href'])((error, urlList)=>{
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


module.exports.startpars = startParser;