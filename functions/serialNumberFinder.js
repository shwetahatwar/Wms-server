const db = require("../models");
const MaterialInward = db.materialinwards;
const Shelf = db.shelfs;
const Rack = db.racks;
const Zone = db.zones;
const Picklist = db.picklists;

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
};

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
};

exports.getLatestPicklistSerialNumber = async () => {
  var serialNumber = "";

  var picklistData = await Picklist.findOne({
    order: [
    ['id', 'DESC'],
    ]
  });

  serialNumber = picklistData["picklistName"];
  serialNumber = serialNumber.substring(serialNumber.length - 6, serialNumber.length);
  serialNumber = (parseInt(serialNumber) + 1).toString();
  var str = '' + serialNumber;
  while (str.length < 6) {
    str = '0' + str;
  }
  serialNumber = "P" + str;
  
  if (!picklistData){
    serialNumber ="P" + "100001";
    return serialNumber
  }
  return serialNumber;
};