let Parser = require('./universalParser');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');
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
start();