require('dotenv').config();
const { Sequelize } = require('sequelize');
password = 'Mazeluna13';
username = 'root;';
console.log('MYSQL_USER', process.env.MYSQL_USER);
console.log('MYSQL_PASSWORD', process.env.MYSQL_PASSWORD);
console.log('MYSQL_DB', process.env.MYSQL_DATABASE);
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: "MySQL",
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
