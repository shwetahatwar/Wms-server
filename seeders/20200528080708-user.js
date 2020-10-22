'use strict';
var bcrypt = require('bcrypt-nodejs');
var bbPromise = require('bluebird');

var getHashPassword = function(password) {
  return new bbPromise(function(resolve, reject) {
    bcrypt.genSalt(5, function(err, salt) {
      if (err) { reject(err); return; }
      bcrypt.hash(password, salt,null, function(err, hash) {
        if (err) { reject(err); return; }
        resolve(hash);
      });
    });
  });
}

module.exports = {
  up:async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    var password = await getHashPassword("briot");

    const roles = await queryInterface.sequelize.query(
      `SELECT id, name from roles;`
      );
    const role = roles[0].filter(el => el.name.toLowerCase() == 'admin');
    
    const sites = await queryInterface.sequelize.query(
      `SELECT id, name from sites;`
      );
    const site = sites[0].filter(el => el.name.toLowerCase() == 'briot');

      return queryInterface.bulkInsert('users', [{
        username: "Admin",
        password: password,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roleId: role[0]["id"],
        siteId: site[0]["id"],
        employeeId:1001,
        createdBy: "Admin",
        updatedBy: "Admin"
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('users', null, {});
  }
};
