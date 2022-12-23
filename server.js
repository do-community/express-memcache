const express = require('express');
const findPrime = require('./utils/findPrime');
const memcache = require('./services/memcache');
const cacheView = require('./middleware/cacheView');
const session = require('express-session');
const MemcacheStore = require('connect-memjs')(session);

const app = express();

app.set('view engine', 'ejs');

app.use(
  session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    store: new MemcacheStore({
      servers: [process.env.MEMCACHIER_SERVERS],
      prefix: 'session_',
    }),
  })
);

/**
 * Session sanity check middleware
 */
app.use(function (req, res, next) {
  console.log('Session ID:', req.session.id);

  // Get the item from the cache
  memcache.get(`session_${req.session.id}`, (err, val) => {
    if (err) console.log(err);

    if (val !== null) {
      console.log('Session from cache:', val.toString());
    }
  });

  next();
});

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

  // The URL of the page being 'liked'
  const url = `/?n=${n}`;

  // The view for this URL has changed, so the cached version is no longer valid, delete it from the cache.
  const key = `view_${url}`;
  memcache.delete(key, (err) => {
    if (err) console.log(err);
  });

  res.redirect(url);
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Example app is listening on port ${port}.`)
);
