const express = require('express');
const findPrime = require('./utils/findPrime');
const memcache = require('./services/memcache');
const cacheView = require('./middleware/cacheView');

const app = express();

app.set('view engine', 'ejs');

/**
 * Key is `n`
 * Value is the number of 'likes' for `n`
 */
const likesMap = {};

app.get('/', cacheView, (req, res) => {
  const n = req.query.n;
  
  if (!n) {
    res.render('index');
    return;
  }
  
  let prime;

  const key = 'prime_' + n;

  memcache.get(key, (err, val) => {
    if (err) console.log(err);

    if (val !== null) {
      // Use the value from the cache
      // Convert Buffer string before converting to number
      prime = parseInt(val.toString());
    } else {
      // No cached value available, find it
      prime = findPrime(n);

      memcache.set(key, prime.toString(), { expires: 0 }, (err) => {
        if (err) console.log(err);
      });
    }

    // Initialize likes for this number when necessary
    if (!likesMap[n]) likesMap[n] = 0;

    const locals = { n, prime, likes: likesMap[n] };
    res.render('index', locals);
  });
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
