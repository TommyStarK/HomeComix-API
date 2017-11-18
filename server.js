const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/router.js');
const database = require('./database.js');
const account = require('./account/manager.js');

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

// Account management
app.post('/api.homecomix/register', account.register);
app.post('/api.homecomix/authorize', account.authorize);
app.delete('/api.homecomix/delete', account.delete);

// Middlewares
// Ensures that all requests starting with /testmiddlewares/* will be checked
// for the token
app.all('/api.homecomix/:uid/*', [require('./middleware/token')]);

// Mounts the router as middleware at path "/"
app.use('/', router);

// Starts the server
app.listen(port, () => {
	console.log(`${homecomixApi}Server listening on port ${port}`);
	database.connect(err => {
		if (err) {
			console.log(`${homecomixApi}Connection to HomeComix database [${failure}]`);
			throw (err);
		} else {
			console.log(`${homecomixApi}Connection to HomeComix database [${success}]`);
		}
	});
});
