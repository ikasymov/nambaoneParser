let Parser = require('../universalParser');
let start = require('../parser').start;
let Xray = require('x-ray');
let x = Xray();
let data = {
    site: 'http://stylish.kg/blog/planeta-obezyan-voyna',
    bodyPath1: '.content',
    bodyPath2: ['#field-collection-item-field-for-records-full-group-for-verstka p'],
    imgPath1: '.content',
    imgPath2: ['p img@src'],
    group: 1198,
    dataName: 'stylish_news_test'
};


Parser.prototype.getArticleImages = async function(){
    let token = [];
    let urls = await this.getListOfUrls();
    for(let i in urls){
        token.push(await this.saveImageEndReturnToken('http://stylish.kg' + urls[i]))
    }
    return token
};

let url = 'http://stylish.kg/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '#block-views-main-page-block-1 .view-content', ['.views-field.views-field-title .field-content a@href'])((error, urlList)=>{
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
startParser()
module.exports.startpars = startParser;