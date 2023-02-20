import { Sequelize } from "sequelize";
// ---------------------
// Old Config
// ---------------------
// const db = new Sequelize('express_react', 'root', '', {
//     host: "localhost",
//     dialect: "mysql"
// });
// const Sequelize = require('sequelize'); 
// const conn = {};

// -------------------------------------------------
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT
});

export default db;