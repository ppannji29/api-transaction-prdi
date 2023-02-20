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
const db = new Sequelize('express_react', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

export default db;