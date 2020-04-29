var express = require('express');
var router = express.Router();

/**
 * currently only available for slack
 */
router.post('/', function(req, res, next) {
  var auth = {
    login: process.env.USERNAME,
    password: process.env.PASSWORD,
  };

  var b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  var [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login
    && password
    && login === auth.login
    && password === auth.password
  ) {
    var data = JSON.stringify(req.body);
    console.log(data);
    return res.end(data);
  }

  // Access denied...
  res.status(401).send('Authentication failure.')
});

module.exports = router;
