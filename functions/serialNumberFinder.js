const db = require("../models");
const MaterialInward = db.materialinwards;
const Shelf = db.shelfs;
const Rack = db.racks;
const Zone = db.zones;

exports.getLastSerialNumber = async (req, res, next) => {
  var materialInward = await MaterialInward.findOne({
    order: [
    ['id', 'DESC'],
    ],
  });
  if (materialInward) {
    req.materialInward = materialInward.toJSON();
  }
  // console.log("materialInward",materialInward)
  next();
};

exports.getLatestSerialNumber = async () => {
  var materialInward = "";
	var materialInward = await MaterialInward.findOne({
		order: [
		['id', 'DESC'],
		]
	});
  
  if (!materialInward)
    return materialInward
	return materialInward.toJSON();
}

exports.getShelfSerialNumber = async (rackId) => {
 var shelfResponse;
  shelfResponse = await Shelf.findOne({
    where: { 
      rackId: rackId
    },
    include:[{
      model:Rack,
      include:[{
        model:Zone
      }]
    }],
    order: [
    ['id', 'DESC'],
    ]
  });
  console.log("shelfResponse",shelfResponse)
  if(!shelfResponse){
    return shelfResponse
  }
  return shelfResponse.toJSON();
}