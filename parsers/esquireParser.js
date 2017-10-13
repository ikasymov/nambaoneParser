let Xray = require('x-ray');
let x = Xray();
let start = require('../parser').start;
let Handler = require('../handlerStep');
let send = require('../send');

// let data = {
//     site: 'http://example.com',
//     bodyPath1: '.post-text',
//     bodyPath2: ['.display p'],
//     imgPath1: '.post-text',
//     imgPath2: ['.image_block img@src'],
//     group: 1192,
//     dataName: 'esquire_test'
// };


let url = 'https://esquire.ru/stories';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.cardlist', ['ul li a@href'])((error, urlList)=>{
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
    let handler = new Handler(list, 'esquire');
    let url = await handler.getUrl();
    if(url){
      await send(url, 1192)
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
})