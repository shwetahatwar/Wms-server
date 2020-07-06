const db = require("../models");
const PartNumber = db.partnumbers;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

// Create and Save a new PartNumber
exports.create =async (req, res,next) => {
  var {partNumber,description,UOM,netWeight,netVolume} = req.body;
  
  if (!partNumber || !description) {
    return next(HTTPError(500, "Part Number not created,partNumber or description field is empty"))
  }

  var partNumber;
  try {
      partNumber = await PartNumber.create({
        partNumber: partNumber,
        description: description,
        UOM: UOM,
        netWeight: netWeight,
        netVolume: netVolume,
        status:true,
        createdBy:req.user.username,
        updatedBy:req.user.username
    })
    if (!partNumber) {
      return next(HTTPError(500, "Part Number not created"))
    }
  } catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,
        err["errors"][0]["message"]
        ))
    }
    else{
      return next(HTTPError(500,
        "Internal error has occurred, while creating the part number."
        ))
    }
  }

  partNumber = partNumber.toJSON();
  req.partNumber = partNumber;

  next();
};

//Get All PartNumbers
exports.getAll =async (req,res,next) =>{
  var queryString = req.query;
  var offset = 0;
  var limit = 100;
  console.log("Line 51", req.query);
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }

  var {partNumber,description,UOM,status} = req.query;

  var whereClause = new WhereBuilder()
  .clause('partNumber', partNumber)
  .clause('description', description)
  .clause('UOM', UOM)
  .clause('status', status).toJSON();

  var getAllParts;
  getAllParts = await PartNumber.findAll({
    where:whereClause,
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  });

  if (!getAllParts) {
    return next(HTTPError(400, "Part Numbers not found"));
  }
  
  req.partsList = getAllParts.map ( el => { return el.get({ plain: true }) } );

  next();
  
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.partsList);
};

//Update PartNumber by Id
exports.update =async (req, res,next) => {
  const id = req.params.id;

  var { partNumber, description , status , UOM , netWeight , netVolume } = req.body;
  
  whereClause = new WhereBuilder()
  .clause('partNumber', partNumber)
  .clause('description', description)
  .clause('UOM', UOM)
  .clause('netWeight', netWeight)
  .clause('netVolume', netVolume)
  .clause('status', status).toJSON();
  console.log(whereClause);

  var updatedPart;
  try {
    updatedPart = await PartNumber.update(whereClause,{
      where: {
        id: id
      }
    });

    if (!updatedPart) {
      return next(HTTPError(500, "Part Number not updated"))
    }
  }catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,
        err["errors"][0]["message"]
        ))
    }
    else{
      return next(HTTPError(500,
        "Internal error has occurred, while updating the part number."
        ))
    }
  }

  req.updatedPart = updatedPart;
  next();
  
};

//Get PartNumber by Id
exports.getById =async (req,res,next) => {
  const id = req.params.id;
  var partNumber = await PartNumber.findByPk(id);
  if (!partNumber) {
    return next(HTTPError(500, "Zone not found"))
  }
  req.partsList = partNumber;
  next();
}

//search query
exports.findPartNumbersBySearchQuery = (req, res) => {
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

  var partNumber ='';
  var UOM ='';
  var description ='';

  if(req.query.partNumber != undefined){
    partNumber = req.query.partNumber;
  }
  if(req.query.description != undefined){
    description = req.query.description;
  }
  if(req.query.UOM != undefined){
    UOM = req.query.UOM;
  }

  PartNumber.findAll({ 
    where: {
      status:1,
      partNumber: {
        [Op.or]: {
          [Op.like]: '%'+partNumber+'%',
          [Op.eq]: ''+partNumber+''
        }
      },
      description: {
        [Op.or]: {
          [Op.like]: '%'+description+'%',
          [Op.eq]: ''+description+''
        }
      },
      UOM: {
        [Op.or]: {
          [Op.like]: '%'+UOM+'%',
          [Op.eq]: ''+UOM+''
        }
      }
    },
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  })
  .then(async data => {
    var countArray =[];
    var responseData =[];
    responseData.push(data);

    var total = 0;
    await PartNumber.count({ 
      where: {
        status:1,
        partNumber: {
          [Op.or]: {
            [Op.like]: '%'+partNumber+'%',
            [Op.eq]: ''+partNumber+''
          }
        },
        description: {
          [Op.or]: {
            [Op.like]: '%'+description+'%',
            [Op.eq]: ''+description+''
          }
        },
        UOM: {
          [Op.or]: {
            [Op.like]: '%'+UOM+'%',
            [Op.eq]: ''+UOM+''
          }
        }
      },
    })
    .then(data => {
      total = data;
    })
    .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving PartNumbers."
      });
    });
    var totalParts = {
      totalCount : total
    }
    countArray.push(totalParts);
    responseData.push(countArray);
    res.send(responseData);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving PartNumbers."
    });
  });
};

// get count of all part numbers whose status =1 
exports.countOfPartNumbers = (req, res) => {
  var total = 0
  PartNumber.count({
    where :
    {
      status :1
    }
  })
  .then(data => {
    total = data;
    var totalCount = {
      totalParts : total 
    }
     res.send(totalCount);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Parts count."
    });
  });
};
