let Parser = require('./universalParser');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');
let Xray = require('x-ray');
let x = Xray();
let data = {
    site: 'http://www.eurosport.ru/football/italian-super-coppa/2017-2018/story_sto6288204.shtml',
    bodyPath1: '.storyfull__content',
    bodyPath2: ['.storyfull__paragraphs p'],
    imgPath1: '.storyfull__content',
    imgPath2: ['.storyfull__paragraphs img@src'],
    group: 1195,
    dataName: 'eurosport_football_test'
};

let url = 'http://www.eurosport.ru/football/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(url, '#navtab_storylist_featured', ['.storylist-container .module.module-headline.std .storylist-container__main-title a@href'])((error, urlList)=>{
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