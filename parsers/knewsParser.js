let parser = require('../parser');
let Xray = require('x-ray');
let x = Xray();
let request = require('request');
let startanother = require('../parser').startanother;

let Handler = require('../handlerStep');
let send = require('../send');

async function getArticleHtml(url){
    return new Promise((resolve, reject)=>{
        let data = {
            url:url,
            method: 'GET'
        };
        request(data, (error, req, body)=>{
            if(error || req.statusCode === 404){
                reject(error || new Error('page not found'))
            }
            resolve(body)
        })
    })
}
async function getArticleBody(url){
    let html = false;
    try{
        html = await getArticleHtml(url);
    }catch(e){
        return e
    }
    return new Promise((resolve, reject)=>{
        x(html, 'article', ['.td-post-content p'])((error, textList)=>{
            resolve(textList.join('\n').slice(0, 155) + '.... Что бы читать дальше перейдите по ссылке\n' + url)
        })
    });
}
async function getArticleTheme(url){
    return new Promise((resolve, reject)=>{
        x(url, 'title')((error, title)=>{
            if(!error){
                resolve(title + '\n' + url)
            }
            reject(error)
        })
    });
}

async function getArticleImages(url){
    let html = false;
    try{
        html = await getArticleHtml(url);
    }catch(e){
        return e
    }
    return new Promise((resolve, reject)=>{
        x(html, 'article', '.td-post-content .td-post-featured-image img@src')((error, imgList)=>{
            if(!error){
                resolve(imgList)
            }
            reject(error)
        })
    });
}
let url = 'http://knews.kg/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.lenta .wpb_wrapper', ['.td_block_wrap .td_block_inner h3 a@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList.reverse())
            }
            reject(error)
        })
    })
}


// async function send(url){
//     try{
//         let title = await getArticleTheme(url);
//         return await parser.send(1189, title);
//     }catch(e){
//         return e
//     }
// }
//
// let data = {
//     dataName: 'knews_test'
// };



async function startParser(){
  try{
    let list = await getUrlList();
    let handler = new Handler(list, 'knews');
    let url = await handler.getUrl();
    if(url){
      await send(url, 1189)
    }
    return true
  }catch(e){
    throw e
  }
}

startParser().then(result=>{
    process.exit()
}).catch(error=>{
    console.log(error);
    process.exit()
})
