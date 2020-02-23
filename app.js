const express=  require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cryptoJs = require('crypto-js');

app.get('/history-today/:month/:day', (req, res) => {
  let { month, day } = req.params;
  let fileName = `${month}月${day}日.json`;
  let filePath = path.join(__dirname,'public', 'history-today', fileName);
  let secret = 'ilovelucy';
  fs.readFile(filePath, (err, data) => {
    data = data.toString();
    let encryptedData = cryptoJs.AES.encrypt(data, secret).toString();
    res.send(encryptedData);
  })
})

app.listen(3001);