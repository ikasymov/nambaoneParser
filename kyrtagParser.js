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
    let $ = ch.load(html);
    let contentHtml = $('.content .v-news-detail.inner-news.v-news-detail-page').children()
    contentHtml.first().remove();
    contentHtml.remove('.news-tags');
    let text = $('.content .v-news-detail.inner-news.v-news-detail-page').text()
    return text.trim()
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
        x(html, '.content', '.v-news-detail.inner-news.v-news-detail-page img@src')((error, imgList)=>{
            if(!error){
                if(imgList !== undefined){
                    let index = imgList.indexOf('?')
                    if(index !== -1){
                        resolve('http://' + imgList.slice(0, index).slice(2))
                    }
                }else{
                    resolve(false)
                }
            }
            reject(error)
        })
    });
}

async function send(url, group){
    let body = await getArticleBody(url);
    let title = await getArticleTheme(url);
    let img = await getArticleImages(url);
    let token = await parser.getImageToken(img);
    let result = await parser.send(group, title, body, [token]);
    console.log(result)
}

async function getUrlList(url, element){
    return new Promise((resolve , reject)=>{
        x(url, '.news-list ul', ['li .v-news-head .v-news-info ' + element + ' a@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList)
            }
            reject(error)
        })
    });
}



async function start(dataName, group, url, element){
    let list = await getUrlList(url, element);
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
let urlForParseUrlsRu = 'http://kyrtag.kg/';
let urlForParseUrlsKG = 'http://kyrtag.kg/kg';
let urlForParseUrlsEn = 'http://kyrtag.kg/en';
let dataNameRu = 'kyrtag_test_ru';
let dataNameKG = 'kyrtag_test_kg';
let dataNameEn = 'kyrtag_test_en';
start(dataNameRu, 1183, urlForParseUrlsRu, 'h3');
start(dataNameEn, 1185, urlForParseUrlsEn, 'h2');
start(dataNameKG, 1184, urlForParseUrlsKG, 'h2');
