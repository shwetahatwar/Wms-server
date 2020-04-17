const db = require("../models");
const Material = db.materials;
const User = db.users;
const Role = db.roles;
const Site = db.sites;
const Access = db.access;
var XLSX = require('xlsx'),
     xls_utils = XLSX.utils;

exports.uploadUserMaster = async (req,res) =>{
  const role = {
      name: "Admin",
      status:true,
      createdBy:"admin",
      updatedBy:"admin"
    };

   var siteData;
    const site = {
      name: "BRiOT",
      status:true,
      createdBy:"admin",
      updatedBy:"admin"
    };

    await  Site.create(site)
    .then(data => {
      siteData = data["dataValues"]["id"];
    });

    var roleData;
    Role.create(role)
    .then(data => {
      console.log("Line 180",data["dataValues"]["id"]);
      roleData = data["dataValues"]["id"];
      const user = {
        username: "admin",
        password: "briot",
        status: "1",
        roleId: roleData,
        siteId: siteData,
        employeeId:1004,
        createdBy:"admin",
        updatedBy:"admin"
      };

      // Save User in the database
      User.create(user)
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the User."
          });
        });

    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the role."
      });
    });

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
          status:true,
          createdBy:"admin",
          updatedBy:"admin"
        };

        await Access.create(accessData)
        .then(data => {
          console.log("Line 34", data);
        })
        .catch(err => {
          console.log("Line 37", err);
          res.status(500).send({
            message:
            err.message || "Some error occurred while creating the role."
          });
        });
      }
    }
    catch{
      console.log("In Error");
    }
}