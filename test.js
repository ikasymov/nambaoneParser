let db = require('./models');

let async  = require('async');
// db.Parser.update({value: 'https://rus.azattyk.org/a/28681576.html'}).then(value=>{
//     console.log(value.value)
// });
// db.Parser.update({value: 'https://www.azattyk.org/a/28681416.html', where:{
//     key: 'azattyk_test_kg'
// }}).then(value=>{
//     console.log(value.value)
// })
// db.Parser.findOrCreate({
//     where: {
//         key: 'elsebek'
//     },
//     defaults: {
//         key: 'elsebek',
//         value: 'http://stylish.kg/blog/kartina-iz-ayrana-iskusstvo-bez-granic-kyrgyzskogo-hudozhnika'
//     }
// }).then(value=>{
//     console.log(value[0].key)
// })
// let data = {
//     a: 'asdf',
//     b: 'sdfasdf'
// };
// let a = [1, 2, 3, 4, 5, 6];
//
// async function logic(elem, data, callback){
//     callback(elem)
// }
//
// async.map(a, (item, callback)=>{
//     return logic(item, data, callback)
// }, (error, result)=>{
//     console.log(error)
//     console.log(result)
// })
db.Parser.findOne({where: {
    key: 'imndeit_test'
}}).then(parser=>{
    parser.update({value: 'http://lmndeit.kg/2017/05/13/karpou/'})
})

// db.Parser.findOne({where: {
//     key: 'azattyk_test_kg'
// }}).then(parser=>{
//     parser.update({value: 'https://www.azattyk.org/a/28681416.html'})
// })