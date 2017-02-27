'use strict';

let axios = require('axios');
let pForever = require('p-forever');
let fs = require('fs');
let path = require('path');

let baseUrl = 'https://en.wiktionary.org/w/api.php';

let params = {
  action :'query',
  format :'json',
  list   :'categorymembers',
  cmtitle:'Category:English_lemmas',
  cmlimit:500
};

let fileName = Date.now() + '.txt'

let file = fs.createWriteStream(fileName, 'utf8');

let write = (string) => {
  return new Promise((res, rej) => {
    file.write(string, 'utf8', (err) => {
      if(!err){
        res();
      } else {
        rej(err);
      }
      file.removeAllListeners('error');
    });

    file.on('error', (err) => {
      file.removeAllListeners('error');
      rej(err);
    });
  });
};

let makeString = (words) => {
  return '"' + words.join('", "') + '", ';
};

let counter = 0;

pForever(() => {
  return axios.get(baseUrl, {params})
    .then((res) => {

      let data = res.data;
      params.cmcontinue = data.continue.cmcontinue;
      let words = data.query.categorymembers.map(x => x.title);
      console.log(`Loop ${++counter}, got ${words.length} words, to ${words[words.length - 1]}`);
      return write(makeString(words));
    })
    .catch((err) => {
      console.log('GOT ERR');
      console.log(err);
    });

});



