let Parser = require('../universalParser');
let Xray = require('x-ray');
let x = Xray();
let start = require('../parser').start;
let data = {
    site: 'http://www.eurosport.ru/tennis/atp-cincinnati/2017/story_sto6288975.shtml',
    bodyPath1: '.storyfull__content',
    bodyPath2: ['.storyfull__paragraphs p'],
    imgPath1: 'head',
    imgPath2: 'script',
    group: 1194,
    dataName: 'eurosport_test'
};

Parser.prototype.getListOfUrls = async function(){
    let html = await this.getArticleHtml();
    return new Promise((resolve, reject)=>{
        x(html, this.imgPath1, this.imgPath2)((error, imgList)=>{
            if(!error){
                try{
                    let imgJson = JSON.parse(imgList);
                    resolve([imgJson.image.url])
                }catch(e){
                    reject(e)
                }
            }
            reject(error)
        })
    });
};


let url = 'http://www.eurosport.ru/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.storylist-latest-content', ['.storylist-latest__picture a@href'])((error, urlList)=>{
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