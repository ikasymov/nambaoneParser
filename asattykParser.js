let Parser = require('./universalParser');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');
let Xray = require('x-ray');
let x = Xray();


let dataRU = {
    site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
    bodyPath1: '#content',
    bodyPath2: ['.wsw p'],
    imgPath1: '#content .row',
    imgPath2: ['.cover-media .img-wrap img@src'],
    group: 1181,
    dataName: 'azattyk_test_ru'
};
let dataKG = {
    site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
    bodyPath1: '#content',
    bodyPath2: ['.wsw p'],
    imgPath1: '#content .row',
    imgPath2: ['.cover-media .img-wrap img@src'],
    group: 1180,
    dataName: 'azattyk_test_kg'
};

async function getUrlList(url){
    return new Promise((resolve, reject)=>{
        x(url, '#ordinaryItems', ['li .content a@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList)
            }
            reject(error)
        })
    });
}

async function start(data, url){

    let list = await getUrlList(url);
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

let rusUrl = 'https://rus.azattyk.org/z/4795';
let kgUrl = 'https://www.azattyk.org/z/828';

start(dataRU, rusUrl);
start(dataKG, kgUrl);