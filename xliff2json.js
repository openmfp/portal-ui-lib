#!/usr/bin/env node

const xliff2js = require('xliff/cjs/xliff2js');
const targetOfjs = require('xliff/targetOfjs');
var fs = require('fs');
const dirname = './projects/lib//src/lib/i18n/';
const targetDir = 'dist/assets/translation-files/';
try {
  // delete directory recursively
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true });
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      console.log(err);
      return;
    }
    filenames.forEach(function (filename) {
      let newFilename = filename.substring(0, filename.length - 6);
      fs.readFile(dirname + filename, 'utf8', (err, xliff) => {
        if (err) {
          console.log(err);
          return;
        }
        xliff2js(xliff, (err, res) => {
          if (err) {
            console.log(err);
            return;
          }
          res = targetOfjs(res);
          fs.writeFileSync(
            targetDir + `${newFilename}.json`,
            JSON.stringify(res),
            'utf-8'
          );
        });
      });
    });
    console.log('Translation files created');
  });
} catch (err) {
  console.log('err xliff converter', err);
}
