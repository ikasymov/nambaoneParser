let Parser = require('./universalParser');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');
let Xray = require('x-ray');
let x = Xray();
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
                let imgJson = JSON.parse(imgList);
                resolve([imgJson.image.url])
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