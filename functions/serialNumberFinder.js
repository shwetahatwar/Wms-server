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

exports.getLatestSerialNumber = async () =>{
	var materialInward = await MaterialInward.findOne({
		order: [
		['id', 'DESC'],
		],
	});
	return materialInward.toJSON();
}