let Xray = require('x-ray');
let x = Xray();
let start = require('../parser').start;
let Handler = require('../handlerStep');
let send = require('../send');
let ruGroup = 1181;
let kgGroup = 1180;

// let dataRU = {
//     site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
//     bodyPath1: '#content',
//     bodyPath2: ['.wsw p'],
//     imgPath1: '#content .row',
//     imgPath2: ['.cover-media .img-wrap img@src'],
//     group: 1181,
//     dataName: 'azattyk_test_ru'
// };
// let dataKG = {
//     site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
//     bodyPath1: '#content',
//     bodyPath2: ['.wsw p'],
//     imgPath1: '#content .row',
//     imgPath2: ['.cover-media .img-wrap img@src'],
//     group: 1180,
//     dataName: 'azattyk_test_kg'
// };

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
    try{
        let rusUrl = 'https://rus.azattyk.org/z/4795';
        let kgUrl = 'https://www.azattyk.org/z/828';
        let ruUrls = await getUrlList(rusUrl);
        let kgUrls = await getUrlList(kgUrl);
        // dataRU.urlList = ruUrls;
        // dataKG.urlList = kgUrls;
        let ru = new Handler(ruUrls, 'azattyk_ru');
        let kg = new Handler(kgUrls, 'azattyk_kg');
        let rurl = await ru.getUrl();
        let kurl = await kg.getUrl();
        if(rurl){
            await send(rurl, ruGroup)
        }
        if(kurl){
            await send(kurl, kgGroup)
        }
        return false
    }catch(e){
        return e
    }

}

startParser().then(result=>{
    console.log(result)
    process.exit();
}).catch(e=>{
    console.log(e)
});
