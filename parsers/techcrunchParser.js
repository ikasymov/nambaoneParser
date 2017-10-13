let Parser = require('../universalParser');
let start = require('../parser').start;
let Xray = require('x-ray');
let x = Xray();
let Handler = require('../handlerStep');
let send = require('../send');
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
    console.log('get article images')
    let token = [];
    try{
        let urls = await this.getListOfUrls();
        token.push(await this.saveImageEndReturnToken(urls[0]));
        return token
    }catch(e){
        return e
    }

};

Parser.prototype.getArticleBody = async function(){
    let html = false;
    try{
        html = await this.getArticleHtml();
    }catch(e){
        return e
    }
    return new Promise((resolve, reject)=>{
        x(html, this.bodyPath1, this.bodyPath2)((error, textList)=>{
            if(!error){
                console.log('get article body')
                resolve(textList.join('\n').slice(0, 155) + '.... To continue, press \n' + this.site)
            }
            reject(error)
        })
    })
};

let url = 'https://techcrunch.com/';
async function getUrlList(){
    console.log('get urls')
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
  try{
    let list = await getUrlList();
    let handler = new Handler(list, 'tech');
    let url = await handler.getUrl();
    if(url){
      await send(url, 1193)
    }
    return true
  }catch(e){
    throw e
  }
}
startParser().then(result=>{
    process.exit();
}).catch(error=>{
    console.log(error)
});