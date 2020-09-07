const db = require("../models");
const Project = db.projects;
const Op = db.Sequelize.Op;
var HTTPError = require('http-errors');

// Create and Save a new Project
exports.create = async (req, res, next) => {
  var { name,description} = req.body;
  
  if (!name || !description) {
    return next(HTTPError(500, "Project not created,name or description field is empty"))
  }
  var site = req.site;
  if(req.siteId){
    site = req.siteId
  }
  var project;
  try {
    project = await Project.create({
      name: name,
      description: description,
      status:true,
      siteId:site,
      createdBy:req.user.username,
      updatedBy:req.user.username
    })
    if (!project) {
      return next(HTTPError(500, "Project not created"))
    }
  } 
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while creating the project."))
    }
  }

  project = project.toJSON();
  req.project = project;

  next();
};


//Get All Project
exports.getAll = async (req,res,next) =>{
  if(req.site){
    req.query.siteId = req.site
  }

  var {siteId, name, description,status,offset,limit} = req.query;
  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  var whereClause = new WhereBuilder()
  .clause('siteId', siteId)
  .clause('name', name)
  .clause('description', description)
  .clause('status', status).toJSON();
  var getAllProjects;
  getAllProjects = await Project.findAll({
    where:whereClause,
    order: [
    ['id', 'DESC'],
    ],
    limit:limit,
    offset:offset
  });
  
  if (!getAllProjects) {
    return next(HTTPError(400, "Project not found"));
  }
  
  req.projectsList = getAllProjects.map ( el => { return el.get({ plain: true }) } );
  req.responseData = req.projectsList;
  next();

}

//Update Project by Id
exports.update =async (req, res,next) => {
  const id = req.params.id;

  var { name, description ,status } = req.body;
  
  updateClause = new WhereBuilder()
  .clause('name', name)
  .clause('description', description)
  .clause('updatedBy', req.user.username) 
  .clause('status', status).toJSON();
  var updatedProject;
  try {
    updatedProject = await Project.update(updateClause,{
      where: {
        id: id
      }
    });

    if (!updatedProject) {
      return next(HTTPError(500, "Project not updated"))
    }
  }
  catch (err) {
    if(err["errors"]){
      return next(HTTPError(500,err["errors"][0]["message"]))
    }
    else{
      return next(HTTPError(500,"Internal error has occurred, while updating the project."))
    }
  }

  req.updatedProject = updatedProject;
  next();
};

//Get Project by Id
exports.getById =async (req,res,next) => {
  const id = req.params.id;

  var project = await Project.findByPk(id);
  if (!project) {
    return next(HTTPError(500, "Project not found"))
  }
  req.projectsList = project;
  req.responseData = req.projectsList;
  next();
};

//search query
exports.findProjectsBySearchQuery = async (req, res,next) => {
  if(req.site){
    req.query.siteId = req.site
  }
  var {name,description,status,siteId,offset,limit} = req.query;
  limit = (limit) ? parseInt(limit) : 100;
  offset = (offset) ? parseInt(offset) : 0;

  name = (name) ? name:'';
  description = (description) ? description:'';

  whereClause = new LikeQueryHelper()
  .clause(name, "name")
  .clause(description, "description")
  .toJSON();

  whereClause.status = true;

  if(siteId){
    whereClause.siteId = siteId
  }

  var data = await Project.findAll({ 
    where: whereClause,
    order: [
    ['id', 'DESC'],
    ],
    offset:offset,
    limit:limit
  });

  if(!data){
    return next(HTTPError(500, "No data found"))
  }

  var responseData =[];
  responseData.push(data);

  var total = await Project.count({ 
    where: whereClause
  });

  var countArray=[];
  var totalProjects = {
    totalCount : total
  }
  countArray.push(totalProjects);
  responseData.push(countArray);

  req.responseData = responseData;
  next();
};

// get count of all Project whose status =1 
exports.countOfProjects =async (req, res,next) => {
  var whereClause = {};
  whereClause.status = true;
  if(req.site){
    whereClause.siteId = req.site;
  }
  var total = await Project.count({
    where :whereClause
  })

  if(!total){
    return next(HTTPError(500, "Internal error has occurred, while getting count of projects"))
  }

  var totalCount = {
    totalParts : total 
  }

  req.responseData = totalCount;
  next();
  
};
