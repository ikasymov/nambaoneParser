let nambaone = 'https://api.namba1.co';
let request = require('request');
let superagent = require('superagent');
let fs = require('fs');
let Xray = require('x-ray');
let x = Xray();
let path = require('path');
let download = require('image-downloader');
function Parser(data, site){
    this.bodyPath1 = data.bodyPath1;
    this.bodyPath2 = data.bodyPath2;
    this.site = site;
    this.imgPath1 = data.imgPath1;
    this.imgPath2 = data.imgPath2;
    this.group = data.group;
    this.dataName = data.dataName
}

Parser.prototype._generateToken = async function(){
    console.log('generate token')
    let data = {
        url: nambaone + '/users/auth',
        method: 'POST',
        body: {
            'phone': '996121121121',
            'password': 'password112'
        },
        json: true
    };
    return new Promise((resolve, reject)=>{
        request(data, (error, req, body)=>{
            if(error || req.statusCode === 404){
                reject(error || new Error('page not found'))
            }
            resolve(body.data.token)
        })
    })
};

Parser.prototype.sendArticle = async function(body, title, imgList){
    console.log('send article')
    let token = false;
    try{
        token = await this._generateToken();
    }catch(e){
        return e
    }
    let dataForSend = {
        url:  nambaone + '/groups/' + this.group +'/post',
        method: 'POST',
        body: {
            content: title + '\r\n\r\n' + body,
            comment_enabled: 1
        },
        headers: {
            'X-Namba-Auth-Token': token,
        },
        json: true
    };
    if(imgList.length > 0){
        dataForSend.body['attachments'] = [];
        for(let i in imgList){
            dataForSend.body.attachments.push({type: 'media/image', content: imgList[i]})
        };
    }
    return new Promise((resolve, reject)=>{
        request(dataForSend, (error, req, body)=>{
            if(error || req.statusCode === 404){
                reject(error || new Error('not page found'));
            }
            resolve(req.statusCode);
        });
    });
}


Parser.prototype.getArticleHtml = async function(){
    return new Promise((resolve, reject)=>{
        let data = {
            url: this.site,
            method: 'GET'
        };
        request(data, (error, req, body)=>{
            if(error || req.statusCode === 404){
                console.log('get article html')
                reject(error || new Error('page not found'))
            }
            resolve(body)
        })
    })
};

Parser.prototype.getArticleBody = async function(){
    let html = false;
    try{
        html = await this.getArticleHtml();
    }catch(e){
        return e
    }
    return new Promise((resolve, reject)=>{
        x(html, this.bodyPath1, this.bodyPath2)((error, textList)=>{
            if(!error && textList.length > 0){
                console.log('get article body')
                resolve(textList.join('\n').slice(0, 155) + '.... Что бы читать дальше перейдите по ссылке\n' + this.site)
            }
            reject(error || 'not body')
        })
    })
};

Parser.prototype.getArticleTheme = async function(){
    return new Promise((resolve, reject)=>{
        x(this.site, 'title')((error, title)=>{
            if(!error){
                resolve(title)
            }
            reject(error)
        })
    })
};

Parser.prototype.getListOfUrls = async function(){
    let html = false;
    try{
        html = await this.getArticleHtml();
    }catch(e){
        return e
    }
    return new Promise((resolve, reject)=>{
        x(html, this.imgPath1, this.imgPath2)((error, imgList)=>{
            if(!error){
                console.log('get list of image urls')
                resolve(imgList)
            }
            reject(error)
        })
    });
};



function deleteFile(path){
    return new Promise((resolve, reject)=>{
        fs.unlink(path, function (error) {
            if(error){
                console.log(error);
                reject(error)
            }
            console.log('File deleted');
            resolve()
        })
    });
}


Parser.prototype.saveImageEndReturnToken = async function(imgUrl){
    console.log('save image and return token')
    let format = imgUrl.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi)[0];
    imgUrl = imgUrl.split('.').slice(0, -1).join('.') + format;
    return new Promise((resolve, reject)=> {
        const options = {
            url: imgUrl,
            dest: './'
        };
        download.image(options).then(({filename, image}) => {
            let file = './'+ filename;
            console.log('download image');
            superagent.post('https://files.namba1.co').attach('file', file).end(function(err, req) {
                console.log('send image');
                if(err){
                    console.log(err);
                    deleteFile(filename);
                    reject(err)
                }
                deleteFile(file).then(result=>{
                    resolve(req.body.file)
                }).catch(error=>{
                    console.log(error);
                    reject(error)
                })
            })
        }).catch(e => {
            console.log(e);
            console.log('error download image');
            reject(e)
        })
        setTimeout(()=>{
            reject(new Error('time out'))
        }, 10000)
    })
};

Parser.prototype.send = async function(){
    console.log('send')
    try{
        let body = await this.getArticleBody();
        let title = await this.getArticleTheme();
        let token = await this.getArticleImages();
        return await this.sendArticle(body, title, token);
    }catch(e){
        return e
    }

};

Parser.prototype.getArticleImages = async function(){
    console.log('get article images')
    let token = [];
    try{
        let urls = await this.getListOfUrls();
        for(let i in urls){
            token.push(await this.saveImageEndReturnToken(urls[i]))
        }
        return token
    }catch(e){
        return e
    }

};

module.exports = Parser;