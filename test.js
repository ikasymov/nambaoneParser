// let Xray = require('x-ray');
// let x = Xray();
//
// async function getUrlList(){
//   return new Promise((resolve, reject)=>{
//     x('https://rus.azattyk.org/z/4795', '#ordinaryItems', ['li .content a@href'])((error, urlList)=>{
//       if(!error){
//         resolve(urlList)
//       }
//       reject(error)
//     })
//   });
// }
//
//
// getUrlList().then(result=>{
//
// });

let db = require('./models');

db.Parser.findAndCountAll({

}).then(result=>{
    console.log(result.count)
});


