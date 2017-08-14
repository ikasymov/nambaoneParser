let nambaone = 'https://api.namba1.co';
let request = require('request');
let superagent = require('superagent');
let fs = require('fs');
let Xray = require('x-ray');
let x = Xray();

function Parser(data){
    this.bodyPath1 = data.bodyPath1;
    this.bodyPath2 = data.bodyPath2;
    this.site = data.site;
    this.imgPath1 = data.imgPath1;
    this.imgPath2 = data.imgPath2;
    this.group = data.group;
    this.dataName = data.dataName
}

Parser.prototype._generateToken = async function(){
    let data = {
        url: nambaone + '/users/auth',
        method: 'POST',
        body: {
            'phone': process.env.user,
            'password': process.env.password
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
    let token = await this._generateToken();
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
                reject(error || new Error('page not found'))
            }
            resolve(body)
        })
    })
};

Parser.prototype.getArticleBody = async function(){
    let html = await this.getArticleHtml();
    return new Promise((resolve, reject)=>{
        x(html, this.bodyPath1, this.bodyPath2)((error, textList)=>{
            if(!error && textList.length > 0){
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
    let html = await this.getArticleHtml();
    return new Promise((resolve, reject)=>{
        x(html, this.imgPath1, this.imgPath2)((error, imgList)=>{
            if(!error){
                resolve(imgList)
            }
            reject(error)
        })
    });
};

Parser.prototype.getArticleImages = async function(){
    let token = [];
    let urls = await this.getListOfUrls();
    for(let i in urls){
        token.push(await this.saveImageEndReturnToken(urls[i]))
    }
    return token
}



Parser.prototype.saveImageEndReturnToken = async function(imgUrl){
    let value = Math.random();
    return new Promise((resolve, reject)=>{
        if (imgUrl){
            request(imgUrl).pipe(fs.createWriteStream('./' + 'kp' +  value + imgUrl.slice(-4))).on('finish', function (error, req) {
                if (error){
                    reject(error);
                }
                superagent.post('https://files.namba1.co').attach('file', './' + 'kp' +  value + imgUrl.slice(-4)).end(function(err, req) {
                    fs.unlink('./' + 'kp' +  value + imgUrl.slice(-4), function (error, value) {});
                    resolve(req.body.file);
                });
            });
        }
        else{
            resolve(imgUrl)
        }
    });
};

Parser.prototype.send = async function(){
    try{
        let body = await this.getArticleBody();
        let title = await this.getArticleTheme();
        let token = await this.getArticleImages();
        return await this.sendArticle(body, title, token);
    }catch(e){
        console.log(e)
    }

};

Parser.prototype.getArticleImages = async function(){
    let token = [];
    let urls = await this.getListOfUrls();
    for(let i in urls){
        token.push(await this.saveImageEndReturnToken(urls[i]))
    }
    return token
};

module.exports = Parser;