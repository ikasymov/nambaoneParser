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
    let html = false;
    try{
        html = await getArticleHtml(url);
    }catch(e){
        return e
    }
    return new Promise((resolve, reject)=>{
        x(html, 'article', ['.td-post-content p'])((error, textList)=>{
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
    let html = false;
    try{
        html = await getArticleHtml(url);
    }catch(e){
        return e
    }
    return new Promise((resolve, reject)=>{
        x(html, 'article', '.td-post-content .td-post-featured-image img@src')((error, imgList)=>{
            if(!error){
                resolve(imgList)
            }
            reject(error)
        })
    });
}
let url = 'http://saat.kg/';

async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.wpb_wrapper .vc_tta-container .vc_general.vc_tta.vc_tta-tabs', ['.td-block-row h3 a@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList.reverse())
            }
            reject(error)
        })
    })
}

async function send(url){
    try{
        let body = await getArticleBody(url);
        let title = await getArticleTheme(url);
        let img = await getArticleImages(url);
        let token = await parser.getImageToken(img);
        return parser.send(1188, title, body, [token]);
    }catch(e){
        return e
    }
}

let data = {
    dataName: 'saat_test'
};


async function startParser(){
    data.urlList = await getUrlList();
    return startanother(data, send);
}
startParser().then(result=>{
    process.exit();
}).catch(error=>{
    console.log(error)
})