let Xray = require('x-ray');
let x = Xray();
let start = require('../parser').start;

let dataRU = {
    site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
    bodyPath1: '#content',
    bodyPath2: ['.wsw p'],
    imgPath1: '#content .row',
    imgPath2: ['.cover-media .img-wrap img@src'],
    group: 1181,
    dataName: 'azattyk_test_ru'
};
let dataKG = {
    site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
    bodyPath1: '#content',
    bodyPath2: ['.wsw p'],
    imgPath1: '#content .row',
    imgPath2: ['.cover-media .img-wrap img@src'],
    group: 1180,
    dataName: 'azattyk_test_kg'
};

async function getUrlList(url){
    return new Promise((resolve, reject)=>{
        x(url, '#ordinaryItems', ['li .content a@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList)
            }
            reject(error)
        })
    });
}


async function startParser(){
    let rusUrl = 'https://rus.azattyk.org/z/4795';
    let kgUrl = 'https://www.azattyk.org/z/828';
    let ruUrls = await getUrlList(rusUrl);
    let kgUrls = await getUrlList(kgUrl);
    dataRU.urlList = ruUrls;
    dataKG.urlList = kgUrls;
    let kgResult = await start(dataKG);
    let ruResult = await start(dataRU);
    return kgResult + '|' + ruResult
}

module.exports.startpars = startParser;