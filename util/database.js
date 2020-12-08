const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'alif', '12345', {
  dialect: 'mysql',
  host: 'localhost'
});    // it creates single instance and its available throughtout the program even if we import it in differenet places

module.exports = sequelize;
