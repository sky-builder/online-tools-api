const express=  require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cryptoJs = require('crypto-js');
const axios = require('axios');
const cors = require('cors')
const puppeteer = require('puppeteer');

app.use(cors());
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

app.get('/bing-daily-photo', (req, res) => {
  axios.get('https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1')
  .then(resp => {
    res.send(resp.data);
  })
  .catch(err => {
    console.log(err);
    res.send(err)
  })
})
puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
.then(async (browser) => {
  const page = await browser.newPage();
  app.get('/download-ig-image', async (req, res) => {
    let url = req.query.url;
    // use tor
    //const browser = await puppeteer.launch({args:['--proxy-server=socks5://127.0.0.1:9050']});
    //page.on('request', (request) => {
      //console.log(`Intercepting: ${request.method} ${request.url}`);
    // request.continue();
    //});
    // await page.goto(url, {waitUntil: 'networkidle2'});
    await page.goto(url);

    //const title = await page.title();
    //console.log(title);
    //await page.screenshot({path:'example.png'});
    const imgs = await page.$$eval('img.FFVAD[src]', imgs => imgs.map(img => img.getAttribute('src')));
    if (imgs && imgs[0]) {
      axios.get(imgs[0], {
        responseType: 'stream'
      })
      .then(resp => {
        resp.data.pipe(res)
        .on('finish', () => {
          res.end('done')
        })
        .on('error', () => {
          res.end('error')
        })
      })
    } else {
      res.end('no image found.')
    }
    // const html = await page.content();
    // fs.writeFileSync(path.join(__dirname,'ig.html'), html);
  })
})

app.listen(3001);