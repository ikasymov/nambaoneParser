let Parser = require('./universalParser');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');
let Xray = require('x-ray');
let x = Xray();
let data = {
    site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
    bodyPath1: '.content',
    bodyPath2: '',
    imgPath1: '.content',
    imgPath2: ['img@src'],
    group: 1191,
    dataName: 'habra_test'
};

Parser.prototype.getArticleBody = async function(){
    let html = await this.getArticleHtml();
    return new Promise((resolve, reject)=>{
        x(html, this.bodyPath1)((error, textList)=>{
            if(!error && textList.length > 0){
                resolve(textList.slice(0, 155) + '.... Что бы читать дальше перейдите по ссылке\n' + this.site)
            }
            reject(error || 'not body')
        })
    })
};

let url = 'https://habrahabr.ru/all/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.posts_list', ['.post__body.post__body_crop .buttons a@href'])((error, urlList)=>{
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