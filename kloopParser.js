let parser = require('./parser');
let Xray = require('x-ray');
let x = Xray();
let xpath = require('xpath')
    , dom = require('xmldom').DOMParser;
let request = require('request');
let ch = require('cheerio');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');

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
            resolve(textList.join('\n'))
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
    let result = await parser.send(group, title, body, [token]);
    console.log(result)
}

async function start(dataName, group, url){
    let list = await getUrlList(url);
    let urlList = list.reverse();
    client.get(dataName, (error, value)=>{
        let cutList = urlList.slice(urlList.indexOf(value) + 1);
        if(cutList.length > 0){
            cutList.forEach((elem)=>{
                send(elem, group)
            });
            client.set(dataName, cutList.slice(-1)[0])
        }else{
            console.log('Not List')
        }
    });
}
let urlForParseUrlsRu = 'https://kloop.kg/news/';
let urlForParseUrlsKG = 'http://ky.kloop.asia/news/';
let dataNameRu = 'kloop_test_ru';
let dataNameKG = 'kloop_test_kg';
start(dataNameRu, 1186, urlForParseUrlsRu);
start(dataNameKG, 1187, urlForParseUrlsKG);
