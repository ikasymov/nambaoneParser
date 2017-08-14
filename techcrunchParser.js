let Parser = require('./universalParser');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');
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

async function start(){

    let list = await getUrlList();
    let urlList = list.reverse();
    client.get(data.dataName, (error, value)=>{
        let cutList = urlList.slice(urlList.indexOf(value) + 1);
        if(cutList.length > 0){
            cutList.forEach((elem)=>{
                data.site = elem;
                let siteParser = new Parser(data);
                siteParser.send().then(result=>{
                    console.log(result)
                })
            });
            client.set(data.dataName, cutList.slice(-1)[0])
        }else{
            console.log('Not List')
        }
    });

}
start()