let Parser = require('./universalParser');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');
let Xray = require('x-ray');
let x = Xray();
let data = {
    site: 'https://www.sports.ru/tribuna/blogs/thesteal/1368410.html',
    bodyPath1: 'article',
    bodyPath2: ['.material-item__content p'],
    imgPath1: 'article',
    imgPath2: ['.material-item__content img@src'],
    group: 1196,
    dataName: 'sport_news_test'
};

let url = 'https://www.sports.ru/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.columns-layout__main', ['article h2 a@href'])((error, urlList)=>{
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