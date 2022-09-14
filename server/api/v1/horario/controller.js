

const Model = require('./model');
const Role = require('../role/model');
const Persona = require('../persona/model');
const { paginar } = require('../../../utils');
const { singToken } = require('./../auth');

const mongoose = require("mongoose");

const { fields } = require('./model');

exports.id = async (req, res, next, id) => {
  try {
    const doc = await Model.findById(id).exec();
    if (!doc) {
      const message = `${Model.modelName} not found`;
      next({
        message,
        statusCode: 404,
        level: 'warn',
      });
    } else {
      req.doc = doc;
      next();
    }
  } catch (error) {
    next(new Error(error));
  }
}

exports.create = async (req, res, next) => {
  const { body = {}, decoded = {}, params = {} } = req;
  const { _id = null } = decoded;
  if (_id) {
    body.addedUser = _id;
  }
  Object.assign(body, params);
  const document = new Model(body);

  try {
    const doc = await document.save();
    res.status(201);
    res.json({
      success: true,
      data: doc
    });
  } catch (err) {
    next(new Error(err));
  }
};

exports.all = async (req, res, next) => {
  const { query = {}, decoded = {} } = req;
  const { _id = null } = decoded;
  const { limit, page, skip } = paginar(query);

  const persona = await Persona.findOne({ "_id": _id });
  const role = await Role.findOne({ "_id": { $in: persona.tipo } });


  try {
    let docs;
    let totalHorario;
    if (role.nombre.includes('Super')) {
      docs = await Model
        .find({})
        .populate('idMarca')
        .populate('idCiudad')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .skip(skip).limit(limit)
        .sort({ '_id': -1 })
        .exec();

      //total de registros
      totalHorario = await Model.countDocuments().exec();
    } else if (role.nombre.includes('Admin')) {
      docs = await Model
        .find({
          $and: [
            { idMarca: { $in: persona.idMarca } },
            { idCiudad: { $in: persona.idCiudad } },
          ]
        })
        .populate('idMarca')
        .populate('idCiudad')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .skip(skip).limit(limit)
        .sort({ '_id': -1 })
        .exec();

      //total de registros
      totalHorario = await Model.countDocuments().exec();
    }




    res.json({
      success: true,
      data: docs,
      totalHorario
    });
  } catch (err) {
    next(new Error(err));
  }

  /* const { query = {} } = req;
  const { limit, page, skip } = paginar(query);


  try {
    const docs = await Model
      .find({})
      .populate('idMarca')
      .populate('idCiudad')
      .populate('addedUser', 'nombresApellidos tipo email estado')
      .populate('modifiedUser', 'nombresApellidos tipo email estado')
      .skip(skip).limit(limit)
      .sort({ '_id': -1 })
      .exec();

    //total de registros
    const totalHorario = await Model.countDocuments().exec();


    res.json({
      success: true,
      data: docs,
      totalHorario
    });
  } catch (err) {
    next(new Error(err));
  } */

};

exports.allSinLimite = async (req, res, next) => {

  const { query = {} } = req;


  try {
    const docs = await Model
      .find({})
      .populate('idMarca')
      .populate('idCiudad')
      .populate('addedUser', 'nombresApellidos tipo email estado')
      .populate('modifiedUser', 'nombresApellidos tipo email estado')
      .sort({ '_id': -1 })
      .exec();

    res.json({
      success: true,
      data: docs
    });
  } catch (err) {
    next(new Error(err));
  }

};

exports.ByCiudadMarcaEstado = async (req, res, next) => {

  const { query = {}, body } = req;
  const { idCiudad, idMarca, estado } = body;

  let ciudad = [];
  idCiudad.forEach(element => {
    ciudad.push(mongoose.Types.ObjectId(element));
  });
  let marca = [];
  idMarca.forEach(element => {
    marca.push(mongoose.Types.ObjectId(element));
  });

  try {
    const docs = await Model
      .find({
        $and:
          [
            { idCiudad: { $in: ciudad } },
            { idMarca: { $in: marca } },
            { estado: estado }
          ]
      })
      .populate('idMarca')
      .populate('idCiudad')
      .populate('addedUser', 'nombresApellidos tipo email estado')
      .populate('modifiedUser', 'nombresApellidos tipo email estado')
      .exec();

    //total de registros
    const totalHorario = await Model.countDocuments().exec();


    res.json({
      success: true,
      data: docs,
      totalHorario
    });
  } catch (err) {
    next(new Error(err));
  }

};

exports.ByAllCiudadMarcaEstado = async (req, res, next) => {

  const { query = {}, body, decoded = {} } = req;
  const { _id = null } = decoded;

  const persona = await Persona.findOne({ "_id": _id });
  const role = await Role.findOne({ "_id": { $in: persona.tipo } });



  try {
    let docs;
    if (role.nombre.includes('Super')) {
      docs = await Model
        .find({
          $and:
            [
              { estado: true }
            ]
        })
        .populate('idMarca')
        .populate('idCiudad')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .exec();
    } else if (role.nombre.includes('Admin') || role.nombre.includes('Docente')) {
      docs = await Model
        .find({
          $and:
            [
              { idCiudad: { $in: persona.idCiudad } },
              { idMarca: { $in: persona.idMarca } },
              { estado: true }
            ]
        })
        .populate('idMarca')
        .populate('idCiudad')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .exec();
    }
    //total de registros
    const totalHorario = await Model.countDocuments().exec();


    res.json({
      success: true,
      data: docs,
      totalHorario
    });
  } catch (err) {
    next(new Error(err));
  }

};

exports.read = async (req, res, next) => {
  const { doc = {} } = req;
  res.json({
    success: true,
    data: doc
  });
};

exports.update = async (req, res, next) => {
  const { doc = {}, body = {} } = req;
  Object.assign(doc, body);
  try {
    const update = await doc.save();
    res.json({
      success: true,
      data: update
    });
  } catch (error) {
    next(new Error(error));
  }
};

exports.delete = async (req, res, next) => {
  const { doc = {} } = req;
  try {
    const removed = await doc.remove();
    res.json({
      success: true,
      data: removed
    });
  } catch (error) {
    next(new Error(error));
  }
};
