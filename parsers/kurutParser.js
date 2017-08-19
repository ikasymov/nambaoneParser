let parser = require('../parser');
let Xray = require('x-ray');
let x = Xray();
let request = require('request');
let startanother = require('../parser').startanother;
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
        x(html, 'article', ['.entry-content'])((error, textList)=>{
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
async function getListOfUrls(url){
    let html = await getArticleHtml(url);
    return new Promise((resolve, reject)=>{
        x(html, 'article', ['.entry-content img@src'])((error, imgList)=>{
            if(!error){
                resolve(imgList)
            }
            reject(error)
        })
    });
}

async function getArticleImages(url){
    let token = [];
    let urls = await getListOfUrls(url);
    for(let i in urls){
        token.push(await parser.getImageToken(urls[i]))
    }
    return token
}


async function getUrlList(url){
    return new Promise((resolve, reject)=>{
        x(url, '#main .home_page ul', ['li .home-post-title a@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList)
            }
            reject(error)
        })
    })
}


async function send(url){
    let body = await getArticleBody(url);
    if(body.trim()){
        let title = await getArticleTheme(url);
        let token = await getArticleImages(url);
        return await parser.send(1190, title, body, token);
    }else{
        console.log('not body content')
    }
}
let urlForParserUrlList = 'http://kurut.kg/';

let data = {
    dataName: 'kurut_test'
};

async function startParser(){
    data.urlList = await getUrlList(urlForParserUrlList);
    return startanother(data, send);
}
startParser()
