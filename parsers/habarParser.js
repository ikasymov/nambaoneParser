let Parser = require('../universalParser');
let start = require('../parser').start;
let Xray = require('x-ray');
let x = Xray();
let Handler = require('../handlerStep');
let send = require('../send');
//
// let data = {
//     site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
//     bodyPath1: 'article',
//     bodyPath2: ['.post__body.post__body_full .post__text.post__text-html'],
//     imgPath1: 'article',
//     imgPath2: ['img@src'],
//     group: 1191,
//     dataName: 'habra_test'
// };


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
  try{
    let list = await getUrlList();
    let handler = new Handler(list, 'habar');
    let url = await handler.getUrl();
    if(url){
      await send(url, 1191)
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
