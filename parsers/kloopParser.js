let parser = require('../parser');
let Xray = require('x-ray');
let x = Xray();
let request = require('request');
let db = require('../models');
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
    let html = await getArticleHtml(url);
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
                resolve(title)
            }
            reject(error)
        })
    });
}

async function getArticleImages(url){
    let html = await getArticleHtml(url);
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

async function send(url, group){
    let body = await getArticleBody(url);
    let title = await getArticleTheme(url);
    let img = await getArticleImages(url);
    let token = await parser.getImageToken(img);
    return parser.send(group, title, body, [token]);
}

async function start(dataName, group, url){
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
}

async function startParser(){
    let urlForParseUrlsRu = 'https://kloop.kg/news/';
    let urlForParseUrlsKG = 'http://ky.kloop.asia/news/';
    let dataNameRu = 'kloop_test_ru';
    let dataNameKG = 'kloop_test_kg';
    let ru = await start(dataNameRu, 1186, urlForParseUrlsRu);
    let kg = await start(dataNameKG, 1187, urlForParseUrlsKG);
    return ru + '|' + kg

}
startParser()
