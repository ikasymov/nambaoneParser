let nambaone = 'https://api.namba1.co';
let request = require('request');
let superagent = require('superagent');
let fs = require('fs');
let db = require('./models');
let async = require('async');
let sequelize = require('sequelize')
let Parser = require('./universalParser');
let download = require('image-downloader');

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

async function getDateTime() {

    let date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    let year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    let day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    let dash = '-';
    return year + dash + month + dash + day;

};

async function generateToken(){
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
}


async function sendArticle(groupId, title, body, imgList){
    let token = await generateToken();
    let dataForSend = {
        url:  nambaone + '/groups/' + groupId +'/post',
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


async function saveImageEndReturnToken(imgUrl){
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
}

async function start(data){

    let list = data.urlList;
    let urlList = list.reverse();
    let value = await db.Parser.findOrCreate({
        where: {
            key: data.dataName
        },
        default: {
            key: data.dataName,
            value: urlList[0]
        }
    });
    if(value[0].value !== null){
        let cutList = urlList.slice(urlList.indexOf(value[0].value) + 1);

        if(cutList.length > 0){
            for (let  i in cutList){
                let siteParser = new Parser(data, cutList[i]);
                try{
                    let result = await siteParser.send();
                    console.log(result)
                }catch(e){
                    console.log(e);
                    return
                }
            }
            cutList.forEach((elem)=>{

            });
            await value[0].update({value: cutList.slice(-1)[0]});
            return 'OK'
        }else{
            console.log('Not List')
        }
    }else{
        value[0].update({value: urlList[0]})
    }

}

async function startAnother(data, send){
    let urlList = data.urlList;
    let value = await db.Parser.findOrCreate({
        where: {
            key: data.dataName
        },
        default: {
            key: data.dataName,
            value: urlList[0]
        }
    });
    let cutList = urlList.slice(urlList.indexOf(value[0].value) + 1);
    if(cutList.length > 0){
        for (let i in cutList){
            await send(cutList[i]).then(result=>{
                console.log(result)
            })
        }
        await value[0].update({value: cutList.slice(-1)[0]});
        return 'OK'

    }else{
        console.log('Not List')
    }

}

module.exports.startanother = startAnother;
module.exports.start = start;
module.exports.send = sendArticle;
module.exports.token = generateToken;
module.exports.date = getDateTime;
module.exports.getImageToken = saveImageEndReturnToken;