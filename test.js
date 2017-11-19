'use strict';

const comic = require('comic-info');
const filePath = require('path').join(require('os').homedir(), 'Downloads/test.cbr');

console.log(filePath);

new comic({
  path: filePath
}).then(res => {
  if (res) {
    console.log('Success!', res);
   }
 }).catch(err => {
   if (err){
     console.log('Failed!', err);
    }
   });
