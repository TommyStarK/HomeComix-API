const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/router.js');

const app = express();

// Port setting
const port = process.env.PORT || 3000;

// Allows nested object
app.use(bodyParser.urlencoded({extended: true}));
// Parses incoming request bodies in a middleware
app.use(bodyParser.json());

// Middlewares
// Ensures that all requests starting with /testmiddlewares/* will be checked
// for the token
app.all('/homecomix/testmiddlewares/*', [require('./middlewares/token')]);

// Mounts the router as middleware at path "/"
app.use('/', router);

// Starts the server
app.listen(port, () => {
	console.log(`HomeComix server listening on port ${port}`);
});
