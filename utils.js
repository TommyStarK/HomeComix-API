
module.exports = {
	hash(target) {
		const hash = require('crypto').createHash('sha256');
		hash.update(target);
		return hash.digest('hex');
	}
};
