const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/router.js');
const database = require('./database.js');

const success = '\x1b[32mOK\x1b[0m';
const failure = '\x1b[31mFAILED\x1b[0m';
const homecomixApi = '[\x1b[35mHomeComix-API\x1b[0m] ';

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
	console.log(`${homecomixApi}server listening on port ${port}`);
	database.connect(err => {
		if (err) {
			console.log(`${homecomixApi}Connection to HomeComix database [${failure}]`);
			throw (err);
		} else {
			console.log(`${homecomixApi}Connection to HomeComix database [${success}]`);
		}
	});
});
