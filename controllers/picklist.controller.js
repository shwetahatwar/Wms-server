const db = require("../models");
const Picklist = db.picklists;
const PicklistMaterialList = db.picklistmateriallists;
const PicklistPickingMaterialList = db.picklistpickingmateriallists;
const MaterialInward = db.materialinwards;
const Op = db.Sequelize.Op;
const PartNumber = db.partnumbers;
const Shelf = db.shelfs;
const Sequelize = require("sequelize");
var sequelize = require('../config/db.config.js');
var nodemailer = require ('nodemailer'); 
var HTTPError = require('http-errors'); 
const materialQuantityFunction = require('../functions/materialInwardQuantity');
const serialNumberFinder = require('../functions/serialNumberFinder');
const fifoViolationFunction = require('../functions/fifoViolation');
const sgMail = require('@sendgrid/mail');

// Create and Save a new Picklist
exports.create = async (req, res,next) => {
  if (!req.body.material) {
    return next(HTTPError(500,"Content can not be empty!"))
  } 

  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }

  var responseData;
  var canCreate = 0; 

  for(var i=0;i<req.body.material.length;i++){
    var checkMaterialQty = await materialQuantityFunction.getMaterialQuantity(req.body.material[i]["partNumber"],req.site);
    console.log("checkMaterialQty",checkMaterialQty)
    
    if(checkMaterialQty[0]){
      if(checkMaterialQty[0]["dataValues"]["totalQuantity"] >= parseInt(req.body.material[i].numberOfPacks)){
        canCreate =1;
      }
    }
  }

  if(canCreate == 1){
    let serialNumberId = await serialNumberFinder.getLatestPicklistSerialNumber();
    
    var picklistId;
    let siteId = req.site;
    if(!req.site){
      siteId = req.siteId;
    }
    const picklistData = {
      picklistName: serialNumberId,
      status:true,
      isIssuedToProduction:false,
      picklistStatus:"Pending",
      siteId :siteId,
      createdBy:req.user.username,
      updatedBy:req.user.username
    };

    var picklistCreatedData =  await Picklist.create(picklistData);
    if(!picklistCreatedData["dataValues"]){
      return next(HTTPError(500, "Picklist not created"))
    }
    responseData = picklistCreatedData;
    picklistId = picklistCreatedData["dataValues"]["id"];
    
    for(var i=0;i<req.body.material.length;i++){
      var checkMaterialQty;
      let location;

      var materialDataQty = await materialQuantityFunction.getMaterialQuantity(req.body.material[i]["partNumber"],req.site);
      checkMaterialQty = materialDataQty[0]["dataValues"]["totalQuantity"];

      if(checkMaterialQty != 0 && checkMaterialQty != undefined){
        if(checkMaterialQty >= req.body.material[i].numberOfPacks){
          var getBarcodePacks = await materialQuantityFunction.getMaterialPacks(req.body.material[i]["partNumber"],req.site);
          counter = req.body.material[i]["numberOfPacks"];
          var dups = [];
          var arr = getBarcodePacks.filter(function(el) {
          // If it is not a duplicate, return true
          if (dups.indexOf(el["barcodeSerial"]) == -1) {
            dups.push(el["barcodeSerial"]);
            return true;
          }
          return false;
        });

          for(var s=0;s<dups.length;s++){
            if(counter != 0 && counter > 0){
              var barcodePackQuantity1 = await materialQuantityFunction.getMaterialPacksWithLocation(req.body.material[i]["partNumber"],req.site,dups[s]);
              var barcodePackQuantity = barcodePackQuantity1[0]["dataValues"]["eachPackQuantity"]; 

              if(barcodePackQuantity1[0]["dataValues"]["shelf"]){
                location =barcodePackQuantity1[0]["dataValues"]["shelf"]["barcodeSerial"]
              }
              console.log("barcodePackQuantity",barcodePackQuantity)
              var partDescription='';
              var partNumber = await PartNumber.findOne({ 
                where:{
                  partNumber:req.body.material[i]["partNumber"]
                }
              });

              if(partNumber){
                partDescription = partNumber["description"]
              }
              if(barcodePackQuantity >= counter){
                const picklistMaterialListData = {
                  picklistId: picklistId,
                  batchNumber: dups[s],
                  numberOfPacks:counter,
                  purchaseOrderNumber:req.body.material[i]["purchaseOrderNumber"],
                  partNumber:req.body.material[i]["partNumber"],
                  partDescription:partDescription,
                  location:location,
                  createdBy:req.user.username,
                  updatedBy:req.user.username
                }
                await PicklistMaterialList.create(picklistMaterialListData)
                .then(picklistMaterialList=>{

                })
                .catch(err=>{
                  console.log("Error on line 132",err);
                });

                counter = counter - counter;
                break;
              }
              else if(barcodePackQuantity != 0){
                const picklistMaterialListData = {
                  picklistId: picklistId,
                  batchNumber: dups[s],
                  numberOfPacks:barcodePackQuantity,
                  partNumber:req.body.material[i]["partNumber"],
                  purchaseOrderNumber:req.body.material[i]["purchaseOrderNumber"],
                  partDescription:partDescription,
                  location:location,
                  createdBy:req.user.username,
                  updatedBy:req.user.username
                }
                PicklistMaterialList.create(picklistMaterialListData)
                .then(picklistMaterialList=>{
                })
                .catch(err=>{
                  console.log(err);
                });
                counter = counter - barcodePackQuantity;
              }
            }
          }
        }
      }
    }
    req.responseData = responseData;
    next();
  }
  else{
    return next(HTTPError(500,"Picklist not created due to insufficient quantity."))
  }
};

// Get all Picklists from the database.
exports.findAll = async (req, res,next) => {
  var { picklistName , status , isIssuedToProduction , picklistStatus , offset , limit } = req.query;

  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var whereClause = new WhereBuilder()
  .clause('picklistName', picklistName)
  .clause('status', status)
  .clause('isIssuedToProduction', isIssuedToProduction)
  .clause('picklistStatus', picklistStatus).toJSON();

  if(req.site){
    whereClause.siteId = req.site;
  }

  var picklistData = await Picklist.findAll({ 
    where: whereClause,
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  });

  if (!picklistData) {
    return next(HTTPError(400, "Picklist not found"));
  }
  
  req.picklistDataList = picklistData.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.picklistDataList;
  next();
};

exports.getCountForPicklist = async (req,res,next) =>{
  let responseData =[];
  
  for(var i=0;i<req.body.length;i++){
    var checkMaterialQty = await materialQuantityFunction.getMaterialQuantity(req.body[i]["partNumber"],req.site);
   
    if(checkMaterialQty[0]){
      let item = {
        "partNumber":req.body[i].partNumber,
        "quantity":checkMaterialQty[0]["dataValues"]["totalQuantity"]
      }
      responseData.push(item);
    }
    else{
      let item = {
        "partNumber":req.body[i].partNumber,
        "quantity":0
      }
      responseData.push(item);
    }
  }
  
  req.responseData = responseData;
  next();
};

// Find a single Picklist with an id
exports.findOne = async (req, res,next) => {
  const id = req.params.id;

  var picklist = await Picklist.findByPk(id);
  if (!picklist) {
    return next(HTTPError(500, "Picklist not found by id="+id))
  }
  req.picklistDataList = picklist;
  req.responseData = req.picklistDataList;
  next();
};

// Update a Picklist by the id in the request
exports.update = async(req, res,next) => {
  const id = req.params.id;
  var { picklistName , status , picklistStatus } = req.body;

  var whereClause = new WhereBuilder()
  .clause('picklistName', picklistName)
  .clause('status', status)
  .clause('updatedBy', req.user.username)
  .clause('picklistStatus', picklistStatus).toJSON();
  
  var picklistUpdated;
  try {
    picklistUpdated = await Picklist.update(whereClause,{
      where: {
        id: id
      }
    });

    if (!picklistUpdated) {
      return next(HTTPError(500, "Picklist not updated"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the Picklist."))
    }
  }

  req.picklistUpdated = picklistUpdated;
  next();
};


//Get Picklist Material List
exports.getPicklistMaterialLists = async (req, res,next) => {  
  var picklistMaterials = await PicklistMaterialList.findAll({ 
    where: req.params
  });

  if (!picklistMaterials) {
    return next(HTTPError(400, "Picklist materials not found"));
  }
  
  req.picklistMaterialsList = picklistMaterials.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.picklistMaterialsList;
  next();
};

//Create Picklist Material List
exports.postPicklistMaterialLists = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.picklistId) {
    return next(HTTPError(500,"Content can not be empty!"))
  } 

  var picklistpickingmateriallist = [];
  for(var i=0;i<req.body.material.length;i++){
      picklistpickingmateriallist[i] = {
      picklistId: req.params.picklistId,
      userId:req.body.userId,
      createdBy:req.user.username,
      updatedBy:req.user.username,
      partNumber:req.body.material[i].partNumber,
      batchNumber:req.body.material[i].batchNumber,
      serialNumber:req.body.material[i].serialNumber
    };
  }
  var picklistMaterialLists = await PicklistMaterialList.bulkCreate(picklistpickingmateriallist);
  
  next();
};

//Get Picklist Material List
exports.getPicklistMaterialList = async(req, res,next) => {

  var picklistMaterials = await PicklistMaterialList.findOne({ 
    where: req.params
  })

  if (!picklistMaterials) {
    return next(HTTPError(400, "Picklist materials not found"));
  }
  
  req.picklistMaterialsList = picklistMaterials
  req.responseData = req.picklistMaterialsList;
  next();
};

//Update Picklist Material List
exports.putPicklistMaterialList = async(req, res,next) => {
  const id = req.params.id;

  var { purchaseOrderNumber, batchNumber , location , numberOfPacks,partNumber,partDescription } = req.body;
  
  whereClause = new WhereBuilder()
  .clause('purchaseOrderNumber', purchaseOrderNumber)
  .clause('batchNumber', batchNumber)
  .clause('numberOfPacks', numberOfPacks)
  .clause('partNumber', partNumber)
  .clause('partDescription', partDescription)
  .clause('updatedBy', req.user.username) 
  .clause('location', location).toJSON();

  try{
    var updatedPicklistMaterial = await PicklistMaterialList.update(whereClause, {
      where: req.params
    });
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the PicklistMaterialList."))
    }
  }
  next();
};


//Picking 
//Get Picklist Picking Material List
exports.getPicklistPickingMaterialLists = async (req, res ,next) => {

  var picklistPickingMaterials = await PicklistPickingMaterialList.findAll({ 
    where: req.params
  });

  if (!picklistPickingMaterials) {
    return next(HTTPError(400, "Picklist picking materials not found"));
  }

  req.picklistPickingMaterialsList = picklistPickingMaterials.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.picklistPickingMaterialsList;
  next();
};


//Create Picklist Picking Material List
exports.postPicklistPickingMaterialLists = async (req, res,next) => {

  console.log(req.body.materials.length);
  for(var i=0;i<req.body.materials.length;i++){
      let violatedData;
      if(req.body.materials[i]["isViolated"]){
        violatedData = req.body.materials[i];
      }
      picklistpickingmateriallist = {
      picklistId: req.params.picklistId,
      userId:1,
      createdBy:req.user.username,
      updatedBy:req.user.username,
      partNumber:req.body.materials[i].partNumber,
      batchNumber:req.body.materials[i].batchNumber,
      serialNumber:req.body.materials[i].serialNumber,
      quantityPicked:req.body.materials[i].quantity,
      isMaterialIssuedToProduction:false
    };

    // Save materials of picklist in the database
    await PicklistPickingMaterialList.create(picklistpickingmateriallist)
    .then(async data => {
      let eachPackQuantity = 0;
      if(req.body.materials[i]["isViolated"]){
        var fifoViolation = await fifoViolationFunction.createFifoViolation(violatedData,req.params.picklistId,req.user.username);
      }
      await MaterialInward.findAll({ 
        where: {
          barcodeSerial:req.body.materials[i].serialNumber
        },
      }).then(data => {
        eachPackQuantity = data[0]["dataValues"]["eachPackQuantity"];
      });
      eachPackQuantity= parseInt(eachPackQuantity) - parseInt(req.body.materials[i].quantity);
      let updatedData = {
        "eachPackQuantity":eachPackQuantity
      }
      console.log("updatedData",updatedData)
      await MaterialInward.update(updatedData, {
        where: {
          barcodeSerial:req.body.materials[i].serialNumber
        }
      })
      .then(async num => {
        if (num == 1) {
        } 
        else {
          console.log("Error updating MaterialInward with barcodeSerial");
        }
      })
      .catch(err => {
        console.log("Error updating MaterialInward with barcodeSerial",err);
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while creating the Picklist Picking Material List."
      });
    });
  }
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  await MaterialInward.findAll({
    where:{
      'QCStatus':1,
      'materialStatus': "Available",
      'status':true,
      'siteId': {
        [Op.like]: checkString
      }
    },
    group: [ 'partNumberId' ],
    attributes: ['partNumberId', [Sequelize.fn('count', Sequelize.col('partNumberId')), 'count'],
    [Sequelize.literal('SUM(eachPackQuantity * 1)'), 'totalQuantity']],
    include: [{
      model: PartNumber,
      attributes: ['description','partNumber']
    }],
    having: Sequelize.where(Sequelize.literal('SUM(eachPackQuantity * 1)'), '<=', 10)
  })
  .then(data => {
    var selfSignedConfig = {
      host: 'smtp.zoho.com',
      port: 465,
            secure: true, // use SSL
            auth: {
              user: "servicedesk@briot.in",
              pass: "UQvm0upjLKBy"
            }
          };
          var transporter = nodemailer.createTransport(selfSignedConfig);

          var result ="Hi Sir, <br/>";
          result = result + "Writing just to let you know that inventory for below part numbers is low.";
          result += "<br/>";
          result += "<br/>";
          result += "<table border=1>";
          result += "<th>Sr No</td>";
          result += "<th>Part Number</td>";
          result += "<th>Part Description</td>";
          result += "<th>Quantity</td>";
          console.log("data",data.length)          
          for(var i=0;i<data.length;i++){
            console.log(data[i]["dataValues"])
            result += "<tr>";
            result += "<td>"+(i+1)+"</td>";
            result += "<td><b>"+data[i]["dataValues"]["partnumber"]["partNumber"]+"</b></td>";
            result += "<td><b>"+data[i]["dataValues"]["partnumber"]["description"]+"</b></td>";
            result += "<td style=text-align:right><b>"+data[i]["dataValues"]["totalQuantity"]+"</b></td>";
            result += "</tr>";
          }
          result += "</table>";
          result += "<br/><br/>";
          result +="Have a great day!";

          console.log(result);
          if(data.length!=0){
            var mailOptions = {
              from: "servicedesk@briot.in", // sender address (who sends)
              to: "sagar@briot.in;servicedesk@briot.in", // list of receivers (who receives)
              subject: "Replenishment Alert", // Subject line
              html: ''+result+'',
            };
            transporter.sendMail(mailOptions, function(error, info) {
              if(error){
                console.log(error);
              } else {
                console.log('Message sent: ' + info.response);
              }
            });
          }
        })
  .catch(err => {
    console.log("Error",err)

  });
  //updated picklist
  var updatedPicklist = {
    picklistStatus: "Completed",
    updatedBy:req.user.username
  }
  await Picklist.update(updatedPicklist, {
    where: {
      id: req.params.picklistId
    }
  })
  .then(async num => {
    if (num == 1) {
      console.log("Picklist updated",req.params.picklistId);
    } 
    else {
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Picklist with id=" + id
    });
  });
  let updatedData={
    "status":false
  }
  await MaterialInward.update(updatedData, {
    where: {
      eachPackQuantity:0
    }
  }).then(async num => {
    if (num == 1) {
    } 
    else {
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Material Stock"
    });
  });
  res.status(200).send({
    message:
    "Completed Successfully."
  });
  
};

//Get Picklist Picking Material List
exports.getPicklistPickingMaterialList = async (req, res,next) => {

  var picklistPickingMaterial = await PicklistPickingMaterialList.findAll({ 
    where: req.params
  });

  if (!picklistPickingMaterial) {
    return next(HTTPError(400, "Picklist picking materials not found"));
  }

  req.picklistPickingMaterialsList = picklistPickingMaterial;
  req.responseData = picklistPickingMaterial;
  next();
};

//Update Picklist Picking Material List
exports.putPicklistPickingMaterialList = async(req, res,next) => {
  const id = req.params.id;
  var { partNumber , batchNumber , serialNumber , quantityPicked , userId } = req.body;

  var whereClause = new WhereBuilder()
  .clause('partNumber', partNumber)
  .clause('batchNumber', batchNumber)
  .clause('userId', userId)
  .clause('quantityPicked', quantityPicked)
  .clause('updatedBy', req.user.username)
  .clause('serialNumber', serialNumber).toJSON();
  
  var picklistUpdated;
  try {
    picklistUpdated = await PicklistPickingMaterialList.update(whereClause,{
      where: req.params
    });

    if (!picklistUpdated) {
      return next(HTTPError(500, "PicklistPickingMaterialList not updated"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the PicklistPickingMaterialList."))
    }
  }
  next();
};

//Get Count of Picklist for Dashboard
exports.getPicklistCountDashboard = async (req, res,next) => {
  var d = new Date();
  var newDay = d.getDate();
  if(newDay.toString().length == 1)
    newDay = "0" + newDay;
  var newMonth = d.getMonth();
  newMonth = newMonth +1;
  if(newMonth.toString().length == 1)
    newMonth = "0" + newMonth;
  var newYear = d.getFullYear();
  var newDateTimeNow = newYear + "-" + newMonth + "-" + newDay;
  var query = "";
  if(req.site){
    query = "SELECT * FROM wms.picklists where siteId="+req.site+" and createdAt like '%" + newDateTimeNow + "%';";
  }
  else{
    query = "SELECT * FROM wms.picklists where createdAt like '%" + newDateTimeNow + "%';";  
  }
  await db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT})
  .then(function(picklists) {
    console.log(picklists);
    var pending = 0;
    var inProgress = 0;
    var completed = 0;
    var total = picklists.length;
    for(var i = 0; i < picklists.length; i++){
      console.log("Line 660",picklists[i]["picklistStatus"]);
      if(picklists[i]["picklistStatus"] == "In Progress"){
        inProgress++;
      }
      else if(picklists[i]["picklistStatus"] == "Pending"){
        pending++;
      }
      else if(picklists[i]["picklistStatus"] == "Completed"){
        completed++;
      }
    }
    var picklistCount = {
      inProgress: inProgress,
      pending: pending,
      completed:completed,
      total:total
    }
    req.responseData = picklistCount;
    next();
  })
  .catch(function(err){
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving count."
    });
  });
};

// //Get Picklist Between Dates
// exports.getPicklistByDate = (req, res) => {
//   // console.log();
//   var queryString = req.query;
//   var offset = 0;
//   var limit = 100;
//   if(req.query.offset != null || req.query.offset != undefined){
//     offset = parseInt(req.query.offset)
//   }
//   if(req.query.limit != null || req.query.limit != undefined){
//     limit = parseInt(req.query.limit)
//   }
//   delete queryString['offset'];
//   delete queryString['limit'];
//   console.log("queryString",queryString);
//   let checkString = '%'+req.site+'%'
//   if(req.site){
//     checkString = req.site
//   }

//   Picklist.findAll({ 
//     where: {
//       createdAt: {
//         [Op.gte]: parseInt(req.query.createdAtStart),
//         [Op.lt]: parseInt(req.query.createdAtEnd),
//       },
//       siteId: {
//         [Op.like]: checkString
//       }
//     },
//     order: [
//     ['id', 'DESC'],
//     ],
//     offset:offset,
//     limit:limit
//   })
//   .then(data => {
//     res.send(data);
//   })
//   .catch(err => {
//     res.status(500).send({
//       message:
//       err.message || "Some error occurred while retrieving picklists."
//     });
//   });
// };

//get by picklist name
exports.findPicklistByName = async (req, res,next) => {
  var { createdAtStart , createdAtEnd , offset , limit , picklistName} = req.query;
  var whereClause = {};
  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  picklistName = (picklistName) ? picklistName:'';

  if(createdAtStart && createdAtEnd){
    whereClause.createdAt = {
      [Op.gte]: parseInt(createdAtStart),
      [Op.lt]: parseInt(createdAtEnd),
    }
  }

  if(picklistName){
    whereClause.picklistName = {
      [Op.like]:'%'+picklistName+'%'
    };
  }

  if(req.site){
    whereClause.siteId = req.site
  }
  whereClause.status = true;
  var picklistData = await Picklist.findAll({ 
    where:whereClause,
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  });

  if (!picklistData) {
    return next(HTTPError(400, "Seached data not found"));
  }

  var responseData =[];
  responseData.push(picklistData);
  var total = await Picklist.count({ 
    where:whereClause,
  });

  var countArray=[];
  var totalPicklists = {
    totalCount : total
  }
  countArray.push(totalPicklists);
  responseData.push(countArray);

  req.responseData = responseData;
  next();
};

//get Picklist count
exports.findPicklistCount = async (req, res,next) => {
var total =0;
  var inProgress=0;
  var completed = 0;
  var total =0;
  var inProgress=0;
  var completed = 0;
  var pending = 0;
  var whereClause = {};
  if(req.site){
    whereClause.siteId = req.site
  }

  whereClause.status = true;
  total = await Picklist.count({
    where:whereClause
  });

  whereClause.picklistStatus="In Progress"

  inProgress = await Picklist.count({
    where:whereClause
  });

  whereClause.picklistStatus="Pending"

  pending = await Picklist.count({
    where:whereClause
  });
  
  whereClause.picklistStatus="Completed";

  completed = await Picklist.count({
    where:whereClause
  });

  let responseData = {
    'total':total,
    'inProgress':inProgress,
    'pending':pending,
    'completed':completed
  }
    req.responseData =responseData;
    next();
};