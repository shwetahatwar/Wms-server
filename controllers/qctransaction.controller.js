const db = require("../models");
const QCTransaction = db.qctransactions;
const MaterialInward = db.materialinwards;
const Op = db.Sequelize.Op;

//Get All QC transactions
exports.getAll = (req,res) =>{
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

  QCTransaction.findAll({ 
    where: req.query,
    include: [{model: MaterialInward}],
    offset:offset,
    limit:limit 
  })
  .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving ScrapandRecover."
      });
    });
};

// Find a single QC Transaction with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  InventoryTransaction.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving InventoryTransaction with id=" + id
      });
    });
};