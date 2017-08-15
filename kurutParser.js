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
        let result = await parser.send(1190, title, body, token);
        console.log(result)
    }else{
        console.log('not body content')
    }
}
let dataName = 'kurut_test';
let urlForParserUrlList = 'http://kurut.kg/';
async function start(){
    let list = await getUrlList(urlForParserUrlList);
    let urlList = list.reverse();
    client.get(dataName, (error, value)=>{
        let cutList = urlList.slice(urlList.indexOf(value) + 1);
        if(cutList.length > 0){
            cutList.forEach((elem)=>{
                send(elem)
            });
            client.set(dataName, cutList.slice(-1)[0])
        }else{
            console.log('Not List')
        }
    });
}
start();
