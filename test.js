/**
 * Created by ilgizkasymov on 8/10/17.
 */
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');

// client.set('azattyk_test_ru', 'https://rus.azattyk.org/a/28670707.html')
client.set('kurut_test', 'http://kurut.kg/suluuluk/bul-tyrmak-zhasalga-menen-kajda-barsa-bolot/')
// client.get('kyrtag_test_kg', (error, value)=>{
//     console.log(value)
// });
