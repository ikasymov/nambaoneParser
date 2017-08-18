let Parser = require('../universalParser');
let start = require('../parser').start;
let Xray = require('x-ray');
let x = Xray();
let data = {
    site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
    bodyPath1: 'article',
    bodyPath2: ['.post__body.post__body_full .post__text.post__text-html'],
    imgPath1: '.content',
    imgPath2: ['img@src'],
    group: 1191,
    dataName: 'habra_test'
};


let url = 'https://habrahabr.ru/all/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.posts_list ul', ['article h2 a@href'])((error, urlList)=>{
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
module.exports.startpars = startParser;