const db = require("../models");
const PicklistPickerRelation = db.picklistpickerrelations;
const Picklist = db.picklists;
const Op = db.Sequelize.Op;
const User = db.users;

// Create and Save a new Picklist Picker Relations
exports.create = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.picklistId) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  var userId;
  await User.findAll({ 
    where: {username:req.body.userId} 
  })
  .then(data => {
    userId = data[0]["dataValues"]["id"]
  })
  .catch(err => {
    console.log(err);
  });

  // Create a Picklist Picker Relations
  const picklistpickerrelation = {
    picklistId: req.body.picklistId,
    userId:userId,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  // Save Picklist Picker Relations in the database
  PicklistPickerRelation.create(picklistpickerrelation)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while creating the Picklist Picker Relation."
    });
  });
};

//Get Picklist Picker Relations list
exports.getAll = (req,res) =>{
  if(req.query.serialNumber){
    req.query.serialNumber = req.query.serialNumber.trim();
  }
  PicklistPickerRelation.findAll({
    where:req.query
  })
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Picklist Picker Relation."
    });
  });
};

//Get Picklist Picker Relations by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  PicklistPickerRelation.findByPk(id)
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: "Error retrieving Picklist Picker Relation with id=" + id
    });
  });
};

//Update Picklist Picker Relations by Id
exports.update = (req, res) => {
  const id = req.params.id;
  if(req.body.serialNumber){
    req.body.serialNumber = req.body.serialNumber.trim();
  }
  PicklistPickerRelation.update(req.body, {
    where: req.params
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Picklist Picker Relation was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Picklist Picker Relation with id=${id}. Maybe Picklist Picker Relation was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Picklist Picker Relation with id=" + id
    });
  });
};

//Get User by Picklist Id
exports.getUsersbyPicklist = (req,res) =>{
  var userListArray=[];
  PicklistPickerRelation.findAll({
    where:req.params
  })
  .then(async data => {
    for(var i = 0; i< data.length;i++){
      await User.findAll({
        where:{
          id:data[i]["dataValues"]["userId"]
        }
      })
      .then(userData=>{
        userListArray.push(userData[0]["dataValues"]);
      })
      .catch(err => {
        res.status(500).send({
          message:
          err.message || "Some error occurred while retrieving Picklist Picker Relation."
        });
      })
    }
    res.send(userListArray);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Picklist Picker Relation."
    });
  });
};

//Get Picklist by User
exports.getPicklistbyUser = async (req,res) =>{

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

  var picklistArray=[];
  PicklistPickerRelation.findAll({
    where:req.params
  })
  .then(async data => {
    console.log("Data: ",data.length);
    for(var i = 0; i< data.length;i++){
      await Picklist.findAll({
        where :{
          id:data[i]["dataValues"]["picklistId"]
        },
      })
      .then(picklistData => {
        var updatedAt = picklistData[0]["dataValues"]["updatedAt"];
        if(picklistData[0]["dataValues"]["picklistStatus"] == "Active"){
          picklistArray.push(picklistData[0]["dataValues"]);  
          console.log("Line 182",picklistArray);
        }
        else if(picklistData[0]["dataValues"]["picklistStatus"] == "Picked" && updatedAt.toString().includes(newDateTimeNow)){
          picklistArray.push(picklistData[0]["dataValues"]);  
          console.log("Line 185",picklistArray);
        }
      })
      .catch(err=>{
        res.status(500).send({
          message:
          err.message || "Some error occurred while retrieving Pick List data."
        });
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
    res.send(picklistArray);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Pick List data."
    });
  });
};