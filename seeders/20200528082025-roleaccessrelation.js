'use strict';

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
    const accessList = await queryInterface.sequelize.query(
      `SELECT id, url from accesses;`
      );

    const roles = await queryInterface.sequelize.query(
      `SELECT id, name from roles;`
      );
    const role = roles[0].filter(el => el.name.toLowerCase() == 'admin');
    var json1 = [];
    for(var i=0;i<accessList[0].length;i++){
      const roleAccessData = {
        roleId: role[0]["id"],
        accessId: accessList[0][i]["id"],
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy:"Admin",
        updatedBy:"Admin"
      };
      json1.push(roleAccessData);
    }

     return queryInterface.bulkInsert('roleaccessrelations',
       json1, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('roleaccessrelations', null, {});
  }
};
