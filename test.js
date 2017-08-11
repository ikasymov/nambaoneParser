/**
 * Created by ilgizkasymov on 8/10/17.
 */
let client = require('redis').createClient('redis://h:p8d8e6b778f4b5086a4d4a328f437f873e72bd40522bc0f75c1132a65c213dc3e@ec2-34-231-155-48.compute-1.amazonaws.com:30949');

// client.set('azattyk_test_ru', 'https://rus.azattyk.org/a/28670707.html')
client.set('kloop_test_ru', 'https://kloop.kg/blog/2017/08/11/storonniki-tekebaeva-prekratili-golodovku-iz-za-nedopuska-politika-k-sdache-testa-po-gosyazyku/')
client.set('kloop_test_kg', 'http://ky.kloop.asia/2017/08/11/kyrgyzstan-fifanyn-rejtinginde-bir-sapka-yldyjlap-128-orundu-eeledi/')
