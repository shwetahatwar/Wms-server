const db = require("../models");
const MaterialInward = db.materialinwards;

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