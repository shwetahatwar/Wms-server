const db = require("../models");
const MaterialInward = db.materialinwards;
var HTTPError = require('http-errors');

exports.updateMaterialInward = async(materialInwardData,id)=> {
	try {
		var updatedData = await MaterialInward.update(materialInwardData,{
			where: {
				id: id
			}
		});
	}catch (err) {
		console.log("error in materialinwards update function",error)
	}

  return updatedData;
}