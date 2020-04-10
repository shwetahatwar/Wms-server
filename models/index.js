const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.sites = require("./site.model.js")(sequelize, Sequelize);
db.roles = require("./role.model.js")(sequelize, Sequelize);
db.users = require("./user.model.js")(sequelize, Sequelize);
db.partnumbers = require("./partnumber.model.js")(sequelize, Sequelize);
// db.locations = require("./location.model.js")(sequelize, Sequelize);
db.materialinwards = require("./materialinward.model.js")(sequelize, Sequelize);
db.inventorytransactions = require("./inventorytransaction.model.js")(sequelize, Sequelize);
db.qctransactions = require("./qctransaction.model.js")(sequelize, Sequelize);
db.putawaytransactions = require("./putawaytransaction.model.js")(sequelize, Sequelize);
db.stocktransits = require("./stocktransit.model.js")(sequelize, Sequelize);
db.stocktransactions = require("./stocktransaction.model.js")(sequelize, Sequelize);
db.usersiterelations = require("./usersiterelation.model.js")(sequelize, Sequelize);
db.picklists = require("./picklist.model.js")(sequelize, Sequelize);
db.picklistmateriallists = require("./picklistmateriallist.model.js")(sequelize, Sequelize);
db.picklistpickingmateriallists = require("./picklistpickingmateriallist.model.js")(sequelize, Sequelize);
db.picklistpickerrelations = require("./picklistpickerrelation.model.js")(sequelize, Sequelize);
db.uoms = require("./uom.model.js")(sequelize, Sequelize);
db.access = require("./access.model.js")(sequelize, Sequelize);
db.roleaccessrelations = require("./roleaccessrelation.model.js")(sequelize, Sequelize);
db.zones = require("./zone.model.js")(sequelize, Sequelize);
db.racks = require("./rack.model.js")(sequelize, Sequelize);
db.shelfs = require("./shelf.model.js")(sequelize, Sequelize);
db.projects = require("./project.model.js")(sequelize, Sequelize);
db.issuetoproductiontransactions = require("./issuetoproductiontransaction.model.js")(sequelize, Sequelize);

module.exports = db;