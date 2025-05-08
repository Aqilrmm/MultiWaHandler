const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const Session = sequelize.define('Session', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = Session;
