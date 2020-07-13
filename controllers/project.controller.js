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
  } catch (err) {
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
  var queryString = req.query;
  var offset = 0;
  var limit = 100;

  if(req.query.offset != null || req.query.offset != undefined){
    offset = parseInt(req.query.offset)
  }
  if(req.query.limit != null || req.query.limit != undefined){
    limit = parseInt(req.query.limit)
  }

  if(req.site){
    req.query.siteId = req.site
  }

  var {siteId, name, description,status} = req.query;

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

  next();

}

//Update Project by Id
exports.update =async (req, res,next) => {
  const id = req.params.id;

  var { name, description ,status } = req.body;
  
  whereClause = new WhereBuilder()
  .clause('name', name)
  .clause('description', description)
  .clause('status', status).toJSON();
  var updatedProject;
  try {
    updatedProject = await Project.update(whereClause,{
      where: {
        id: id
      }
    });

    if (!updatedProject) {
      return next(HTTPError(500, "Project not updated"))
    }
  }catch (err) {
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
  next();
};

//search query
exports.findProjectsBySearchQuery = async (req, res,next) => {
  if(req.site){
    req.query.siteId = req.site
  }
  var {name,description,status,siteId,offset,limit} = req.query;
  var newOffset = 0;
  var newLimit = 100;
  if(offset){
    newOffset = parseInt(offset)
  }

  if(limit){
    newLimit = parseInt(limit)
  }

  if(!name){
    name ='';
  }

  if(!description){
    description = '';
  }

  var whereClause = {};
  whereClause.status = true;
  if(name){
    whereClause.name = {
      [Op.like]:'%'+name+'%'
    };
  }
  if(description){
    whereClause.description = {
      [Op.like]:'%'+description+'%'
    };
  }
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

  res.status(200).send(responseData);
  
};

// get count of all Project whose status =1 
exports.countOfProjects =async (req, res) => {
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

  res.status(200).send(totalCount);
  
};

exports.sendCreateResponse = async (req, res, next) => {
  res.status(200).send({message: "success"});
};

exports.sendFindResponse = async (req, res, next) => {
  res.status(200).send(req.projectsList);
};