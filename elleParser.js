let Parser = require('./universalParser');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');
let Xray = require('x-ray');
let x = Xray();
let data = {
    site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
    bodyPath1: '.articleContainer.block-js',
    bodyPath2: ['p'],
    imgPath1: '.articleContainer',
    imgPath2: ['.articleImage img@data-pic4'],
    group: 1199,
    dataName: 'elle_news_test'
};

let url = 'http://www.elle.ru/allarticles/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.place-js', ['.c1.drm a.newsItem__imgBlock@href'])((error, urlList)=>{
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