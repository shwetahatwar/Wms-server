'use strict';
var XLSX = require('xlsx'),
xls_utils = XLSX.utils;

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
    const usersList = await queryInterface.sequelize.query(
      `SELECT id, username from users;`
      );
    const username = usersList[0].filter(el => el.username.toLowerCase() == 'admin');
    console.log("username: ", username[0]);

    var filepath1 = './documents/templates/bulk-upload/RoleAccess.xlsx';
    var workbook1 = XLSX.readFile(filepath1);
    var sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
    var num_rows1 = xls_utils.decode_range(sheet1['!ref']).e.r;
    var json1 = [];
     try{
      for(var i = 1, l = num_rows1; i <= l; i++){

        var accessUrl = xls_utils.encode_cell({c:0, r:i});
        var accessUrlValue = sheet1[accessUrl];
        var accessUrlResult = accessUrlValue['v'];

        const accessData = {
          url: accessUrlResult,
          httpMethod:"CRUD",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        json1.push(accessData)
      }
      console.log("json1",json1)
      return queryInterface.bulkInsert('accesses',json1 , {});
    }
    catch(ex){
      console.log("In Error",ex);
    }
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('accesses', null, {});
  }
};
