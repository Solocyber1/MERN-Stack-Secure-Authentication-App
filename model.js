require('dotenv').config();
const mongoose = require('mongoose');


const connection = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('MongoDB connected');
	} catch (error) {
		console.log('MongoDB connection error:', error);
	}
};

connection();

module.exports = mongoose;
