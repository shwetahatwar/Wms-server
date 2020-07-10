const db = require("../models");
const MaterialInward = db.materialinwards;
const StockTransaction = db.stocktransactions;
const StockTransit =  db.stocktransits;
const PartNumber = db.partnumbers;
const User = db.users;
const Site = db.sites;
const Op = db.Sequelize.Op;

exports.findAll = (req, res) => {
  var queryString = req.query;
  var offset = 0;
  var limit = 100;

  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  StockTransit.findAll({ 
    where: req.query,
    include: [
    {model: MaterialInward},
    {model: Site,
      as: 'fromSite'},
      {model: Site,
        as: 'toSite'},
        {model: User,
          as: 'transferOutUser'},
          {model: User,
            as: 'transferInUser'}
            ],
            offset:offset,
            limit:limit 
          })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving StockTransit."
    });
  });
};

// Find a single Stock transit  with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  StockTransit.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving StockTransit with id=" + id
    });
  });
};

exports.findAllDatewise = (req, res) => {
  var queryString = req.query;
  var offset = 0;
  var limit = 100;

  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  
  console.log(offset);
  console.log(limit);

  StockTransit.findAll({ 
    where: {
      createdAt: {
        [Op.gte]: parseInt(req.query.createdAtStart),
        [Op.lt]: parseInt(req.query.createdAtEnd),
      }
    },
    include: [
    {model: MaterialInward},
    {model: Site,
      as: 'fromSite'},
      {model: Site,
        as: 'toSite'},
        {model: User,
          as: 'transferOutUser'},
          {model: User,
            as: 'transferInUser'}],
            offset:offset,
            limit:limit 
          })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving StockTransit."
    });
  });
};

exports.findBySearchQuery = async (req, res) => {
  var queryString = req.query;
  var offset = 0;
  var limit = 100;
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];
  var responseData = [];
  let checkString = '%'+req.site+'%'
  if(req.site){
    checkString = req.site
  }
  if(req.query.barcodeSerial != undefined && req.query.barcodeSerial != null && 
    req.query.partNumber != undefined && req.query.partNumber != null){
    await MaterialInward.findAll({
      where: {
        barcodeSerial: {
          [Op.or]: {
            [Op.eq]: ''+req.query.barcodeSerial+'',
            [Op.like]: '%'+req.query.barcodeSerial+'%'
          }
        },
        status : 1 ,
        siteId: {
          [Op.like]: checkString
        }
      },
      offset:offset,
      limit:limit 
    }).then(async data => {
      for(var i=0;i<data.length;i++){
        await StockTransit.findAll({
          where: {
            materialInwardId: data[i]["dataValues"]["id"]
          },
          include: [
          {model: MaterialInward},
          {model: Site,
            as: 'fromSite'},
            {model: Site,
              as: 'toSite'},
              {model: User,
                as: 'transferOutUser'},
                {model: User,
                  as: 'transferInUser'}],
                }).then(data => {
                  if(data.length != 0){
                    for(var a=0;a<data.length;a++){
                      responseData.push(data[a]["dataValues"]);
                    }
                  }
                });
              }
              let count = {
                'totalCount':responseData.length
              };
              let dataCount = [];
              let dataList = [];
              dataList.push(responseData);
              dataCount.push(count);
              dataList.push(dataCount);
              console.log("IN barcodeSerial & PartNumber Search");
              res.send(dataList);
            });
  }
  else if(req.query.barcodeSerial != undefined && req.query.barcodeSerial != null){
    await MaterialInward.findAll({
      where: {
        barcodeSerial: {
          [Op.or]: {
            [Op.eq]: ''+req.query.barcodeSerial+'',
            [Op.like]: '%'+req.query.barcodeSerial+'%'
          }
        },
        status : 1 ,
        siteId: {
          [Op.like]: checkString
        }
      },
      offset:offset,
      limit:limit 
    }).then(async data => {
      for(var i=0;i<data.length;i++){
        await StockTransit.findAll({
          where: {
            materialInwardId: data[i]["dataValues"]["id"]
          },
          include: [
          {model: MaterialInward},
          {model: Site,
            as: 'fromSite'},
            {model: Site,
              as: 'toSite'},
              {model: User,
                as: 'transferOutUser'},
                {model: User,
                  as: 'transferInUser'}],
                }).then(data => {
                  if(data.length != 0){
                    if(data.length != 0){
                      for(var a=0;a<data.length;a++){
                        responseData.push(data[a]["dataValues"]);
                      }
                    }
                  }
                });
              }

              let count = {
                'totalCount':responseData.length
              };
              let dataCount = [];
              let dataList = [];
              dataList.push(responseData);
              dataCount.push(count);
              dataList.push(dataCount);
              console.log("IN barcodeSerial Search");
              res.send(dataList);
            });
  }
  else if(req.query.partNumber != undefined && req.query.partNumber != null){
    var partNumberId;
    
    await MaterialInward.findAll({
      where: {
        partNumber: {
          [Op.iLike]:'%'+ req.query.partNumber +'%'
        },
        status : 1,
        siteId: {
          [Op.like]: checkString
        }
      }
    }).then(async data => {
      for(var i=0;i<data.length;i++){
        await StockTransit.findAll({
          where: {
            materialInwardId: data[i]["dataValues"]["id"]
          },
          include: [{model: MaterialInward}]
        }).then(data => {
          if(data.length != 0){
            for(var a=0;a<data.length;a++){
              responseData.push(data[a]["dataValues"]);
            }
          }
        });
      }

      let count = {
        'totalCount':responseData.length
      };
      let dataCount = [];
      let dataList = [];
      dataList.push(responseData);
      dataCount.push(count);
      dataList.push(dataCount);
      console.log("IN part Search");
      res.send(dataList);
    });
  }
};
