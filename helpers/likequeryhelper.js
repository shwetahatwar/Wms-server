const db = require("../models");
const Op = db.Sequelize.Op;

LikeQueryHelper = function() {
    this.obj = {}
}

LikeQueryHelper.prototype.clause = function(input1, input2) {
  if(input1 && input2 == "siteId"){
    this.obj[input2] = input1;
  }
  else{
    this.obj[input2] = {
      [Op.like]:'%' + input1 + '%'
    };
  }

  return this;
}

LikeQueryHelper.prototype.toJSON = function() {
  return this.obj
}

module.exports = LikeQueryHelper;