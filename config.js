var config = {

	//mongo database
	mongo: {
		auth: false,
		username: "",
		password: "",
		port: "27017",
		uri: process.env.MONGO_URI || 'localhost',
		database: 'homecomix-db'
	}
}

module.exports = config;