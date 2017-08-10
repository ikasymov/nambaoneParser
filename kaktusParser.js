let parser = require('./parser');
let Xray = require('x-ray');
let x = Xray();
let xpath = require('xpath')
    , dom = require('xmldom').DOMParser;
let request = require('request');
let ch = require('cheerio');
var async = require('async');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');

async function getArticleBody(html){
    return new Promise((resolve, reject)=>{
        x(html, '#topic', ['.topic-text p'])((error, textList)=>{
            if(!error){
                resolve(textList.join(' '))
            }
            reject(error)
        })
    });
};

async function getArticleHtml(url){
    return new Promise((resolve, reject)=>{
        let data = {
            url: url,
            method: 'POST'
        };
        request(data, (error, req, body)=>{
            if(error || req.statusCode === 404){
                reject(error, new Error('page not found'))
            }
            resolve(body);
        });
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
    })
}

async function getArticleImages(url){
    let html = await getArticleHtml(url);
    return new Promise((resolve, reject)=>{
        x(html, '.topic', ['script'])((error, imgList)=>{
            if(!error || error === null){
                let url = JSON.parse(imgList[1].slice(14, -1)).media.image[0].media_name.original;
                parser.getImageToken(url).then(token=>{
                    resolve(token)
                })
            }else{
                reject(error)
            }
        })
    })
}

async function getUrlList(){
    let date = await parser.date();
    return new Promise((resolve, reject)=>{
        x('http://kaktus.media/?date=' + date + '&lable=8&order=time', '.block_content .cat_content ul ', ['li .t a@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList)
            }
            reject(error)
        })
    });
}

let url = 'http://kaktus.media/doc/361394_vokryg_aziia_moll_prosiat_posadit_novye_derevia_vmesto_sryblennyh.html';

async function send(url){
    let body = await getArticleBody(url);
    let title = await getArticleTheme(url);
    let token = await getArticleImages(url);
    let result = await parser.send(1178, title, body, [token]);
    console.log(result)
}
let dataName = 'kaktus_test';
async function start(){
    let urlList = await getUrlList();
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