let parser = require('../parser');
let Xray = require('x-ray');
let x = Xray();
let request = require('request');
let db = require('../models');

let Handler = require('../handlerStep');
let send = require('../send');
let kgGroup = 1187;
let ruGroup = 1186;

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
        x(html, '.td-post-content', ['p'])((error, textList)=>{
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
        x(html, '.td-post-featured-image', 'img@src')((error, imgList)=>{
            if(!error){
                resolve(imgList)
            }
            reject(error)
        })
    });
}
async function getUrlList(url){
    return new Promise((resolve, reject)=>{
        x(url, '.wpb_wrapper', ['.td_block_wrap .td_block_inner .td-module-thumb a@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList)
            }
            reject(error)
        })
    })
}

// async function send(url, group){
//     try{
//         let title = await getArticleTheme(url);
//         return parser.send(group, title);
//     }catch(e){
//         return e
//     }
//
// }

async function start(dataName, group, url){
    try{
        let list = await getUrlList(url);
        let urlList = list.reverse();
        let value = await db.Parser.findOrCreate({
            where: {
                key: dataName
            },
            defaults: {
                key: dataName,
                value: urlList[0]
            }
        });
        let cutList = urlList.slice(urlList.indexOf(value[0].value) + 1);
        if(cutList.length > 0){
            for(let i in cutList){
                let elem = cutList[i];
                let result = await send(elem, group);
                console.log(result)
            }
            await value[0].update({value: cutList.slice(-1)[0]});
            return 'OK'
        }else{
            console.log('Not List')
        }
    }catch(e){
        return e
    }

}

// async function startParser(){
//     try{
//         let urlForParseUrlsRu = 'https://kloop.kg/news/';
//         let urlForParseUrlsKG = 'http://ky.kloop.asia/news/';
//         let dataNameRu = 'kloop_test_ru';
//         let dataNameKG = 'kloop_test_kg';
//         let ru = await start(dataNameRu, 1186, urlForParseUrlsRu);
//         let kg = await start(dataNameKG, 1187, urlForParseUrlsKG);
//         return ru + '|' + kg
//     }catch(e){
//         return e
//     }
//
//
// }


async function startParser(){
  try{
    let rusUrl = 'https://kloop.kg/news/';
    let kgUrl = 'http://ky.kloop.asia/news/';
    let ruUrls = await getUrlList(rusUrl);
    let kgUrls = await getUrlList(kgUrl);
    // dataRU.urlList = ruUrls;
    // dataKG.urlList = kgUrls;
    let ru = new Handler(ruUrls, 'kloop_ru');
    let kg = new Handler(kgUrls, 'kloop_kg');
    let rurl = await ru.getUrl();
    let kurl = await kg.getUrl();
    if(rurl){
      await send(rurl, ruGroup)
    }
    if(kurl){
      await send(kurl, kgGroup)
    }
    return true
  }catch(e){
    return e
  }
  
}
startParser().then(result=>{
    process.exit();
}).catch(e=>{
    console.log(e);
    process.exit()
})
