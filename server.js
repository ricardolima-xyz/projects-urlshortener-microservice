require('dotenv').config();
require('url');
const dns = require('dns');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();

var urls = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:index', function(req, res) {
  let index = Number.parseInt(req.params.index);
  if (isNaN(index))
    res.json({ error: 'Wrong format'});
  else if (index >= urls.length)
    res.json({ error: 'No short URL found for the given input'});
  else {
    res.redirect(urls[index]);
  }
});

app.post(
  '/api/shorturl', 
  function(req, res, next) {
    try {
      const inputURL = new URL(req.body.url);
      if (inputURL.protocol.substr(0, 4) != 'http') 
        res.json({ error: 'invalid url'});
      else dns.lookup(inputURL.host, (err, address, family) => {
        console.log('address: %j family: IPv%s', address, family);
        if (err)
          res.json({ error: 'invalid url'});
        else 
          next();
      });
    } catch (error) {
      res.json({ error: 'invalid url'});
    }
  },
  function(req, res) {
    let urlToBeShortened = req.body.url;
    let index = urls.indexOf(urlToBeShortened);
    if (index === -1) {
      index = urls.length;
      urls.push(urlToBeShortened);
    }
    res.json({ original_url : urlToBeShortened, short_url : index});
  }
);

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
