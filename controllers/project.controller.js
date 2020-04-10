const db = require("../models");
const Project = db.projects;
const Op = db.Sequelize.Op;

// Create and Save a new Project
exports.create = (req, res) => {
  console.log(req.body);
  // Validate request
  if (!req.body.name) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  const projectData = {
    name: req.body.name,
    description: req.body.description,
    status:true,
    createdBy:req.user.username,
    updatedBy:req.user.username
  };

  
  Project.create(projectData)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err["errors"][0]["message"] || "Some error occurred while creating the project."
      });
    });
};

//Get All Project
exports.getAll = (req,res) =>{
  var queryString = req.query;
  var offset = 0;
  var limit = 100;
  console.log("Line 51", req.query);
  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }
  delete queryString['offset'];
  delete queryString['limit'];

  Project.findAll({
    where:req.query,
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  })
  .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Project."
      });
    });
};

//Update Project by Id
exports.update = (req, res) => {
  const id = req.params.id;

  Project.update(req.body, {
    where: req.params
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Project was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Project with id=${id}. Maybe Project was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Project with id=" + id
      });
    });
};

//Get Project by Id
exports.getById = (req,res) => {
  const id = req.params.id;

  Project.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Project with id=" + id
      });
    });
};

//search query
exports.findProjectsBySearchQuery = (req, res) => {
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

  var name ='';
  var description ='';

  if(req.query.name != undefined){
    name = req.query.name;
  }
  if(req.query.description != undefined){
    description = req.query.description;
  }

  Project.findAll({ 
    where: {
      status:true,
      name: {
        [Op.or]: {
          [Op.like]: '%'+name+'%',
          [Op.eq]: ''+name+''
        }
      },
      description: {
        [Op.or]: {
          [Op.like]: '%'+description+'%',
          [Op.eq]: ''+description+''
        }
      },
    },
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  })
  .then(async data => {
    var countArray =[];
    var responseData =[];
    responseData.push(data);

    var total = 0;
    await Project.count({ 
      where: {
        status:true,
        name: {
          [Op.or]: {
            [Op.like]: '%'+name+'%',
            [Op.eq]: ''+name+''
          }
        },
        description: {
          [Op.or]: {
            [Op.like]: '%'+description+'%',
            [Op.eq]: ''+description+''
          }
        },
      },
    })
    .then(data => {
      total = data;
    })
    .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving Project."
      });
    });
    var totalProjects = {
      totalCount : total
    }
    countArray.push(totalProjects);
    responseData.push(countArray);
    res.send(responseData);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Projects."
    });
  });
};

// get count of all Project whose status =1 
exports.countOfProjects = (req, res) => {
  var total = 0
  Project.count({
    where :
    {
      status :true
    }
  })
  .then(data => {
    total = data;
    var totalCount = {
      totalProjects : total 
    }
     res.send(totalCount);
  })
  .catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred while retrieving Project count."
    });
  });
};

