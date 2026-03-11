var express = require('express');
var router = express.Router();

/* GET filter page. */
router.get('/', function(req, res, next) {
  res.render('filter', { title: 'Filter' });
});

module.exports = router;