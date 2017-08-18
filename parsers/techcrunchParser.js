let Parser = require('../universalParser');
let start = require('../parser').start;
let Xray = require('x-ray');
let x = Xray();
let data = {
    site: 'https://techcrunch.com/2017/08/13/shondaland-comes-to-netflix/',
    bodyPath1: '.l-main',
    bodyPath2: ['#speakable-summary'],
    imgPath1: '.l-main-container',
    imgPath2: ['.article-entry.text img@src'],
    group: 1193,
    dataName: 'techcrunch_test'
};

Parser.prototype.getArticleImages = async function () {
    let token = [];
    let urls = await this.getListOfUrls();
    token.push(await this.saveImageEndReturnToken(urls[0]));
    return token
};

Parser.prototype.getArticleBody = async function(){
    let html = await this.getArticleHtml();
    return new Promise((resolve, reject)=>{
        x(html, this.bodyPath1, this.bodyPath2)((error, textList)=>{
            if(!error){
                resolve(textList.join('\n').slice(0, 155) + '.... To continue, press \n' + this.site)
            }
            reject(error)
        })
    })
};

let url = 'https://techcrunch.com/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.l-main', ['ul li h2 a@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList)
            }
            reject(error)
        })
    })
}

async function startParser(){
    data.urlList = await getUrlList();
    return start(data);
}

module.exports.startpars = startParser;