const db = require("../models");
const PicklistPickerRelation = db.picklistpickerrelations;
const Picklist = db.picklists;
const Op = db.Sequelize.Op;
const User = db.users;
var HTTPError = require('http-errors');

// Create and Save a new Picklist Picker Relations
exports.create = async (req, res,next) => {
  console.log(req.body);
  // Validate request
  var { picklistId , userId } =  req.body;
  if (!picklistId) {
    return next(HTTPError(400,"Content can not be empty!"))
  }
  
  // Create a Picklist Picker Relations
  const picklistpickerrelation = {
    picklistId: picklistId,
    userId: userId,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  // Save Picklist Picker Relations in the database
  var picklistPickerData = await PicklistPickerRelation.create(picklistpickerrelation)
  
  if(!picklistPickerData){
    return res.status(500).send("Picker is not assigned to picklist");
  }

  req.picklistPickerData = picklistPickerData;  

  next();
};

//Get Picklist Picker Relations list
exports.getAll = async (req,res,next) =>{
  var { picklistId , userId } = req.query;

  var whereClause = new WhereBuilder()
  .clause('picklistId', picklistId)
  .clause('userId', userId).toJSON();

  var getAllPicklistData;
  getAllPicklistData = await PicklistPickerRelation.findAll({
    where:whereClause,
    order: [
    ['id', 'DESC'],
    ]
  });
  
  if (!getAllPicklistData) {
    return next(HTTPError(400, "Picklist Picker not found"));
  }
  
  req.picklistPickerList = getAllPicklistData.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.picklistPickerList;
  next();
};

//Get Picklist Picker Relations by Id
exports.getById = async (req,res,next) => {
  const id = req.params.id;

  var picklistPickerData = await PicklistPickerRelation.findByPk(id);
  if (!picklistPickerData) {
    return next(HTTPError(500, "Error retrieving Picklist Picker Relation with id=" + id))
  }
  req.picklistPickerList = picklistPickerData;
  req.responseData = req.picklistPickerList;
  next();  
};

//Update Picklist Picker Relations by Id --- currently not in use
exports.update = async (req, res,next) => {
  const id = req.params.id;
  var { userId, picklistId } = req.body;
  
  whereClause = new WhereBuilder()
  .clause('userId', userId)
  .clause('picklistId', picklistId).toJSON();
  
  var updatedPicklistData;
  try {
    updatedPicklistData = await PicklistPickerRelation.update(whereClause,{
      where: {
        id: id
      }
    });

    if (!updatedPicklistData) {
      return next(HTTPError(500, "Picklist picker not updated"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the Picklist picker."))
    }
  }

  req.updatedPicklistData = updatedPicklistData;
  next();
};


//Get User by Picklist Id
exports.getUsersbyPicklist = async (req,res,next) =>{
  var userListArray=[];

  var picklistPickerData = [];
  picklistPickerData = await PicklistPickerRelation.findAll({
    where:req.params
  });
  
  if(picklistPickerData){
    for(var i = 0; i< picklistPickerData.length;i++){
      var userData =  await User.findAll({
        where:{
          id:picklistPickerData[i]["dataValues"]["userId"]
        }
      });

      if(userData){
        userListArray.push(userData[0]["dataValues"]);
      }
    }
  }
  req.responseData = userListArray;
  next();
};

//Get Picklist by User
exports.getPicklistbyUser = async (req,res,next) =>{

  var d = new Date();
  var newDay = d.getDate();
  if(newDay.toString().length == 1)
    newDay = "0" + newDay;
  var newMonth = d.getMonth();
  var newYear = d.getFullYear();
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  newMonth = monthNames[newMonth];

  var newDateTimeNow = newMonth + " " + newDay + " " + newYear;

  var whereClause = {};
  if(req.site){
    whereClause.siteId = req.site;
  }

  var picklistArray=[];
  PicklistPickerRelation.findAll({
    where:req.params
  })
  .then(async data => {
    for(var i = 0; i< data.length;i++){
      whereClause.id = data[i]["dataValues"]["picklistId"];
      await Picklist.findAll({
        where :whereClause
      })
      .then(picklistData => {
        if(picklistData[0]){
          var updatedAt = picklistData[0]["dataValues"]["updatedAt"];
          if(picklistData[0]["dataValues"]["picklistStatus"] != "Completed"){
            picklistArray.push(picklistData[0]["dataValues"]);  
            console.log("Line 182",picklistArray);
          }
          else if(picklistData[0]["dataValues"]["picklistStatus"] == "Completed" && updatedAt.toString().includes(newDateTimeNow)){
            picklistArray.push(picklistData[0]["dataValues"]);  
            console.log("Line 185",picklistArray);
          }
        }
      })
      .catch(err=>{
        return next(HTTPError(500, "Some error occurred while retrieving Pick List data"));
      })
    }
    picklistArray.sort(function(a, b){
      var nameA=a.picklistStatus.toLowerCase(), 
      nameB=b.picklistStatus.toLowerCase()
        if (nameA < nameB) //sort string ascending
          return -1 
        if (nameA > nameB)
          return 1
        return 0 //default return value (no sorting)
      });

    req.responseData = picklistArray;
    next();
  })
  .catch(err => {
    return next(HTTPError(500, "Some error occurred while retrieving Pick List data"));
  });
};