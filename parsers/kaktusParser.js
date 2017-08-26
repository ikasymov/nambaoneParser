let parser = require('../parser');
let Xray = require('x-ray');
let x = Xray();
let request = require('request');
let scrape = require('html-metadata');
let startanother = require('../parser').startanother;

async function getArticleBody(url){
    return new Promise((resolve, reject)=>{
        x(url, '#topic', ['.topic-text p'])((error, textList)=>{
            if(!error){
                resolve(textList.join('\n').slice(0, 155) + '.... Что бы читать дальше перейдите по ссылке\n' + url)
            }
            reject(error)
        })
    });
};


async function getArticleTheme(url){
    return new Promise((resolve, reject)=>{
        x(url, 'title')((error, title)=>{
            if(!error){
                resolve(title + '\n' + url)
            }
            reject(error)
        })
    })
}

async function getArticleImages(url){
    try{
        let dict = await scrape(url);
        return await parser.getImageToken(dict.twitter.image.src)
    }catch(e){
        return e
    }
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


async function send(url){
    try{
        let title = await getArticleTheme(url);
        return parser.send(1179, title);
    }catch(e){
        console.log(e)
    }

}
let data = {
    dataName: 'kaktus_test'
};


async function startParser(){
    try{
        data.urlList = await getUrlList();
        return startanother(data, send);
    }catch(e){
        return e
    }
}

startParser().then(result=>{
    process.exit();
}).catch(e=>{
    console.log(e)
})
