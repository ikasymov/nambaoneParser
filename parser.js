let nambaone = 'https://api.namba1.co';
let request = require('request');
let superagent = require('superagent');
let fs = require('fs');
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
}


module.exports.send = sendArticle;
module.exports.token = generateToken;
module.exports.date = getDateTime;
module.exports.getImageToken = saveImageEndReturnToken;