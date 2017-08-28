let Parser = require('../universalParser');
let db = require('../models');
let Xray = require('x-ray');
let x = Xray();
let data = {
    site: 'https://www.sports.ru/football/1054674857.html',
    bodyPath1: 'article',
    bodyPath2: ['.news-item__content p'],
    imgPath1: 'article',
    imgPath2: ['.news-item__content img@src'],
    group: 1197,
    dataName: 'sport_football_news_test'
};

let url = 'https://www.sports.ru/news/football/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '.tabs-container ul', ['.panel.active-panel .news a@href'])((error, urlList)=>{
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
    let value = await db.Parser.findOrCreate({
        where: {
            key: data.dataName
        },
        defaults: {
            key: data.dataName,
            value: urlList.slice(-1)[0]
        }
    });
    let cutList = urlList.slice(urlList.indexOf(value[0].value) + 1);
    if(cutList.length > 0){
        for (let i in cutList){
            let elem = cutList[i];
            let check = elem.slice(-8);
            if(check === 'comments'){
                data.site = elem;
                let siteParser = new Parser(data, elem);
                let result = await siteParser.send();
                console.log(result)
            }
        }
        await value[0].update({value: cutList.slice(-1)[0]});
        return 'OK'
    }else{
        console.log('Not List')
    }

}
async function startParser(){
    return start()
}
startParser().then(result=>{
    process.exit();
}).catch(error=>{
    process.exit()
});
