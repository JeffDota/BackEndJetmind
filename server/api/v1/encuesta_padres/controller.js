

const Model = require('./model');
const Persona = require('../persona/model');
const Role = require('../role/model');
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
  const { body = {} } = req;
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

  console.log(persona);

  try {
    let docs;
    if (role.nombre.includes('Super')) {
      docs = await Model.find({})
        .populate('idEstudiante')
        .populate('idCiudad')
        .populate('idMarca')
        .populate('idDocente')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .skip(skip).limit(limit)
        .sort({ '_id': -1 })
        .exec();
    } else if (role.nombre.includes('Admin')) {
      docs = await Model.find({
        $and: [
          { 'idCiudad': { $in: persona.idCiudad } },
          { 'idMarca': { $in: persona.idMarca } },
        ]
      })
        .populate('idEstudiante')
        .populate('idCiudad')
        .populate('idMarca')
        .populate('idDocente')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .skip(skip).limit(limit)
        .sort({ '_id': -1 })
        .exec();
    }
    console.log(docs);

    res.json({
      success: true,
      data: docs,
    });
  } catch (err) {
    next(new Error(err));
  }

};


exports.buscarByDocenteEncuestaPadres = async (req, res, next) => {
  const { body = {} } = req;
  const { rangoFechas, docentes } = body;
  const { decoded = {} } = req;
  const { _id = null } = decoded;

  const persona = await Persona.findOne({ "_id": _id });
  const role = await Role.findOne({ "_id": { $in: persona.tipo } });
  console.log(role.nombre);
  //separar fechas
  const fechaIncio = rangoFechas.split('to')[0];
  console.log(new Date(fechaIncio));
  const fechaFin = rangoFechas.split('to')[1];
  console.log(new Date(fechaFin));
  let arrayDocentes = [];
  docentes.forEach((docente) => {
    arrayDocentes.push(mongoose.Types.ObjectId(docente.item_id));
  });

  try {
    if (role.nombre.includes('Super')) {
      const docs = await Model.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(fechaIncio), $lte: new Date(fechaFin) }
          }
        },
        {
          $match: {
            idDocente: { $in: arrayDocentes }
          }
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'idDocente',
            foreignField: '_id',
            as: 'idDocente'
          }
        },
        {
          $unwind: '$idDocente'
        },
        {
          $lookup: {
            from: 'estudiantes',
            localField: 'idEstudiante',
            foreignField: '_id',
            as: 'idEstudiante'
          }
        },
        {
          $unwind: '$idEstudiante'
        },
        {
          $lookup: {
            from: 'ciudads',
            localField: 'idCiudad',
            foreignField: '_id',
            as: 'idCiudad'
          }
        },
        {
          $unwind: '$idCiudad'
        },
        {
          $lookup: {
            from: 'marcas',
            localField: 'idMarca',
            foreignField: '_id',
            as: 'idMarca'
          }
        },
        {
          $unwind: '$idMarca'
        }
      ])
      res.json({
        success: true,
        data: docs
      });
    } else if (role.nombre.includes('Admin')) {
      const docs = await Model.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(fechaIncio), $lte: new Date(fechaFin) }
          }
        },
        {
          $match: {
            idDocente: { $in: arrayDocentes }
          }
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'idDocente',
            foreignField: '_id',
            as: 'idDocente'
          }
        },
        {
          $unwind: '$idDocente'
        },
        {
          $match: {
            $and: [
              { 'idDocente.idCiudad': { $in: persona.idCiudad } },
              { 'idDocente.idMarca': { $in: persona.idMarca } },
            ]
          }
        },
        {
          $lookup: {
            from: 'estudiantes',
            localField: 'idEstudiante',
            foreignField: '_id',
            as: 'idEstudiante'
          }
        },
        {
          $unwind: '$idEstudiante'
        },
        {
          $lookup: {
            from: 'ciudads',
            localField: 'idCiudad',
            foreignField: '_id',
            as: 'idCiudad'
          }
        },
        {
          $unwind: '$idCiudad'
        },
        {
          $lookup: {
            from: 'marcas',
            localField: 'idMarca',
            foreignField: '_id',
            as: 'idMarca'
          }
        },
        {
          $unwind: '$idMarca'
        }
      ])
      res.json({
        success: true,
        data: docs
      });
    }
  } catch (err) {
    next(new Error(error));
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
