let Parser = require('./universalParser');
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');
let Xray = require('x-ray');
let iconv = require('iconv-lite');
let x = Xray();
let request = require('request');
let data = {
    site: 'https://pikabu.ru/story/semya_vekhala_v_kuplennyiy_dom_i_nashla_v_chulane_potaynuyu_dvertsu_a_za_ney_nastoyashchee_sokrovishche_5264331',
    bodyPath1: '.post-text',
    bodyPath2: ['.display p'],
    imgPath1: '.story__main',
    imgPath2: ['.b-story__content img@src'],
    group: 1200,
    dataName: 'pikabu_test'
};

async function getBinaryHtml(url){
    return new Promise((resolve, reject)=>{
        let data = {
            url: url,
            method: 'GET',
            encoding: 'binary'
        };
        request(data, (error, req, body)=>{
            if(!error){
                resolve(iconv.decode(body, 'win1251'))
            }
            reject(error)
        })
    })
}


Parser.prototype.getArticleTheme = async function(){
    let html = await getBinaryHtml(this.site);
    return new Promise((resolve, reject)=>{
        x(html, 'title')((error, title)=>{
            resolve(title)
        })
    })
};
Parser.prototype.getArticleHtml = async function(){
    return await getBinaryHtml(this.site)
};

Parser.prototype.getArticleBody = async function(){
    return this.site
};

let url = 'https://pikabu.ru/best';
async function getUrlList(){
    let html = await getBinaryHtml(url);
    return new Promise((resolve, reject)=>{
        x(html, '.inner_wrap .stories', ['.story__main .story__header-title a.story__title-link@href'])((error, urlList)=>{
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