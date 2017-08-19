let Parser = require('../universalParser');
let Xray = require('x-ray');
let x = Xray();
let start = require('../parser').start;
let data = {
    site: 'http://www.eurosport.ru/football/italian-super-coppa/2017-2018/story_sto6288204.shtml',
    bodyPath1: '.storyfull__content',
    bodyPath2: ['.storyfull__paragraphs p'],
    imgPath1: 'head',
    imgPath2: 'script',
    group: 1195,
    dataName: 'eurosport_football_test'
};

Parser.prototype.getListOfUrls = async function(){
    let html = false;
    try{
        html = await this.getArticleHtml();
    }catch(e){
        return e
    }
    return new Promise((resolve, reject)=>{
        x(html, this.imgPath1, this.imgPath2)((error, imgList)=>{
            if(!error){
                let imgJson = JSON.parse(imgList);
                resolve([imgJson.image.url])
            }
            reject(error)
        })
    });
};


let url = 'http://www.eurosport.ru/football';
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
    try{
        data.urlList = await getUrlList();
        return start(data);
    }catch(e){
        return e
    }
}
startParser().then(result=>{
    process.exit();
}).catch(e=>{
    console.log(e)
})

