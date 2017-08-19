let parser = require('../parser');
let Xray = require('x-ray');
let x = Xray();
let request = require('request');
let ch = require('cheerio');
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
    try{
        let html = await getArticleHtml(url);
        let $ = ch.load(html);
        let contentHtml = $('.content .v-news-detail.inner-news.v-news-detail-page').children()
        contentHtml.first().remove();
        contentHtml.remove('.news-tags');
        let text = $('.content .v-news-detail.inner-news.v-news-detail-page').text()
        return text.trim().slice(0, 155) + '.... Что бы читать дальше перейдите по ссылке\n' + url
    }catch(e){
        return e
    }

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
    let html = false;
    try{
        html = await getArticleHtml(url);
    }catch(e){
        return e
    }
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
    try{
        let body = await getArticleBody(url);
        let title = await getArticleTheme(url);
        let img = await getArticleImages(url);
        let token = await parser.getImageToken(img);
        return parser.send(group, title, body, [token]);
    }catch(e){
        return e
    }
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
    try{
        let list = await getUrlList(url, element);
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
            for (let i in cutList){
                let result = await send(cutList[i], group);
                console.log(result)
            }
            value[0].update({value: cutList.slice(-1)[0]})
        }else{
            console.log('Not List')
        }
    }catch(e){
        return e
    }


}



async function startParser(){
    let urlForParseUrlsRu = 'http://kyrtag.kg/';
    let urlForParseUrlsKG = 'http://kyrtag.kg/kg';
    let urlForParseUrlsEn = 'http://kyrtag.kg/en';
    let dataNameRu = 'kyrtag_test_ru';
    let dataNameKG = 'kyrtag_test_kg';
    let dataNameEn = 'kyrtag_test_en';
    try{
        let ru = await start(dataNameRu, 1183, urlForParseUrlsRu, 'h3');
        let en = await start(dataNameEn, 1185, urlForParseUrlsEn, 'h2');
        let kg = await start(dataNameKG, 1184, urlForParseUrlsKG, 'h2');
        return ru + '|' + en + '|' + kg
    }catch(e){
        return e
    }
}
startParser().then(result=>{
    process.exit();
});
