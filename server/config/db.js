import dotenv from 'dotenv';
dotenv.config();

export default {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/skribbl'
};
