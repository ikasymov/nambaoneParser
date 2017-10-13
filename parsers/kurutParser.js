let parser = require('../parser');
let Xray = require('x-ray');
let x = Xray();
let request = require('request');
let startanother = require('../parser').startanother;

let Handler = require('../handlerStep');
let send = require('../send');

async function getArticleHtml(url){
    return new Promise((resolve, reject)=>{
        let data = {
            url:url,
            method: 'GET'
        };
        request(data, (error, req, body)=>{
            if(error || req.statusCode === 404){
                reject(error || new Error('page not found'))
            }
            resolve(body)
        })
    })
}
async function getArticleBody(url){
    let html = false;
    try{
        html = await getArticleHtml(url);
    }catch(e){
        return e
    }
    return new Promise((resolve, reject)=>{
        x(html, 'article', ['.entry-content'])((error, textList)=>{
            resolve(textList.join('\n').slice(0, 155) + '.... Что бы читать дальше перейдите по ссылке\n' + url)
        })
    });
}
async function getArticleTheme(url){
    return new Promise((resolve, reject)=>{
        x(url, 'title')((error, title)=>{
            if(!error){
                resolve(title + '\n' + url)
            }
            reject(error)
        })
    });
}
async function getListOfUrls(url){
    let html = false;
    try{
        html = await getArticleHtml(url);
    }catch(e){
        return e
    }
    return new Promise((resolve, reject)=>{
        x(html, 'article', ['.entry-content img@src'])((error, imgList)=>{
            if(!error){
                resolve(imgList)
            }
            reject(error)
        })
    });
}

async function getArticleImages(url){
    try{
        let token = [];
        let urls = await getListOfUrls(url);
        for(let i in urls){
            token.push(await parser.getImageToken(urls[i]))
        }
        return token
    }catch(e){
        return e
    }
}


async function getUrlList(url){
    return new Promise((resolve, reject)=>{
        x('http://kurut.kg/', '#main .home_page ul', ['li .home-post-title a@href'])((error, urlList)=>{
            if(!error){
                resolve(urlList)
            }
            reject(error)
        })
    })
}


// async function send(url){
//     try{
//         let title = await getArticleTheme(url);
//         if(title.trim()){
//             return await parser.send(1190, title);
//         }else{
//             console.log('not body content')
//         }
//     }catch(e){
//         return e
//     }
// }
// let urlForParserUrlList = '';
//
// let data = {
//     dataName: 'kurut_test'
// };


async function startParser(){
  try{
    let list = await getUrlList();
    let handler = new Handler(list, 'kurut');
    let url = await handler.getUrl();
    if(url){
      await send(url, 1190)
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
});
