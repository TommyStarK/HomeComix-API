const MongoClient = require('mongodb').MongoClient;

let _db;

const database = {
	connect(callback) {
		MongoClient.connect('mongodb://localhost:27017/homecomix-db', (err, db) => {
			_db = db;
			return callback(err);
		});
	},
	get() {
		return _db;
	},
	close() {
		_db.close();
	}
};

module.exports = database;
