const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/router.js');
const app = express();

// Port setting
var port = process.env.PORT || 3000;

// Parses incoming request bodies in a middleware
app.use(bodyParser.json());

//
app.all('/homecomix/testmiddlewares/*', [require('./middlewares/token'), require('./middlewares/log')]);


// Mounts the router as middleware at path "/"
app.use('/', router);

// Starts the server
app.listen(port, function() {
  console.log('HomeComix server listening on port ' + port);
});
