let Parser = require('./universalParser');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');
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
// getUrlList().then(list=>{
//     console.log(list)
// })


async function start(){

    let list = await getUrlList();
    let urlList = list.reverse();
    client.get(data.dataName, (error, value)=>{
        let cutList = urlList.slice(urlList.indexOf(value) + 1);
        if(cutList.length > 0){
            cutList.forEach((elem)=>{
                let check = elem.slice(-8);
                if(check === 'comments'){
                    let url = elem.slice(0, -20);
                    data.site = elem;
                    let siteParser = new Parser(data);
                    siteParser.send().then(result=>{
                        console.log(result)
                    })
                }

            });
            client.set(data.dataName, cutList.slice(-1)[0])
        }else{
            console.log('Not List')
        }
    });

}
start()