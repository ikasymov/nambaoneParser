let Parser = require('../universalParser');
let start = require('../parser').start;
let Xray = require('x-ray');
let x = Xray();
let Handler = require('../handlerStep');
let send = require('../send');

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
  try{
    let list = await getUrlList();
    let handler = new Handler(list, 'lmndeit');
    let url = await handler.getUrl();
    if(url){
      await send(url, 1182)
    }
    return true
  }catch(e){
    throw e
  }
}
startParser().then(result=>{
    process.exit();
}).catch(e=>{
    console.log(e)
})
