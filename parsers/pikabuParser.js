let Parser = require('../universalParser');
let Xray = require('x-ray');
let iconv = require('iconv-lite');
let x = Xray();
let request = require('request');
let start = require('../parser').start;
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

async function startParser(){
    data.urlList = await getUrlList();
    return start(data);
}

startParser()
module.exports.startpars = startParser;