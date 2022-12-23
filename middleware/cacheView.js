const memcache = require('../services/memcache');

/**
 * Express middleware to cache views and serve cached views
 */
module.exports = function (req, res, next) {
  const key = `view_${req.url}`;

  memcache.get(key, (err, val) => {
    if (err) console.log(err);

    if (val !== null) {
      // Convert Buffer string to send as the response body
      res.send(val.toString());
      return;
    }

    const originalSend = res.send;
    res.send = function (body) {
      memcache.set(key, body, { expires: 0 }, (err) => {
        if (err) console.log(err);
      });

      originalSend.call(this, body);
    };

    next();
  });
};
