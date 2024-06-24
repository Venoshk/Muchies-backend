require("dotenv").config();
const dbDataBase = process.env.DB_USER;
const password   = process.env.DB_PASSWORD;

const mongoose = require('mongoose');
const uri = `mongodb+srv://${dbDataBase}:${password}@cluster0.9ignkn2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const connection = () => {
    mongoose.connect(uri,).then(() => {
    console.log('Connected to MongoDB');
    }).catch(err => {
    console.error('Error connecting to MongoDB', err);
    });
}

module.exports = connection