let Parser = require('../universalParser');
let start = require('../parser').start;
let Xray = require('x-ray');
let x = Xray();

let data = {
    site: 'http://www.elle.ru/celebrities/novosty/smi-ravshana-kurkova-vyishla-zamuj/',
    bodyPath1: '#single',
    bodyPath2: ['.row.collapse .entry-content p'],
    imgPath1: '#single',
    imgPath2: ['.row.collapse .entry-content img@src'],
    group: 1182,
    dataName: 'imndeit_test'
};

let urlForParseUrlList = 'http://lmndeit.kg/';
async function getUrlList(){
    return new Promise((resolve, reject)=>{
        x(urlForParseUrlList, '#dpe_fp_widget-3', ['.recent-widget .block-inner a@href'])((error, urlList)=>{
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

module.exports.startpars = startParser;