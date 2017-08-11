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
            url: url,
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
        x(html, '#content', ['.wsw p'])((error, contentList)=>{
            if(!error){
                resolve(contentList.join('\n'))
            }
            reject(error)
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
        x(html, '#content .row', '.cover-media .img-wrap img@src')((error, imgLink)=>{
            if(!error){
                resolve(imgLink)
            }
            reject(error)
        })
    })
};



async function send(url, group){
    let imageUrl = await getArticleImages(url);
    let imageToken = await parser.getImageToken(imageUrl);
    let body = await getArticleBody(url);
    let theme = await getArticleTheme(url);
    let resultCode = await parser.send(group, theme, body, [imageToken]);
    console.log(resultCode)
}


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

async function start(url, dataName, group){
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
let rusUrl = 'https://rus.azattyk.org/z/4795';
let kgUrl = 'https://www.azattyk.org/z/828';
let dataNameRu = 'azattyk_test_ru';
let dataNameKg = 'azattyk_test_kg';
let ruGroup = 1181;
let kgGroup = 1180;
start(rusUrl, dataNameRu, ruGroup);
start(kgUrl, dataNameKg, kgGroup);