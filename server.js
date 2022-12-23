const express = require('express');
const findPrime = require('./utils/findPrime');

const app = express();

app.set('view engine', 'ejs');

/**
 * Key is `n`
 * Value is the number of 'likes' for `n`
 */
const likesMap = {};

app.get('/', (req, res) => {
  const n = req.query.n;
  
  if (!n) {
    res.render('index');
    return;
  }
  
  const prime = findPrime(n);

  // Initialize likes for this number when necessary
  if (!likesMap[n]) likesMap[n] = 0;

  const locals = { n, prime, likes: likesMap[n] };
  res.render('index', locals);
});

app.get('/like', (req, res) => {
  const n = req.query.n;

  if (!n) {
    res.redirect('/');
    return;
  }

  likesMap[n]++;

  res.redirect(`/?n=${n}`);
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Example app is listening on port ${port}.`)
);
