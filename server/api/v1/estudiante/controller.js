
const mongoose = require("mongoose");

const Model = require('./model');
const { paginar } = require('../../../utils');
const { singToken } = require('./../auth');


const { fields } = require('./model');
const Programa = require('../programa/model');

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

  const { query = {} } = req;
  const { limit, page, skip } = paginar(query);


  try {
    const docs = await Model.find({})
      .populate('idRepresentante')
      //.populate('addedUser', 'nombresApellidos tipo email estado')
      //.populate('modifiedUser', 'nombresApellidos tipo email estado')
      .skip(skip).limit(limit)
      .sort({ '_id': -1 })
      .exec();

    const totalEstudiantes = await Model.countDocuments();

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalEstudiantes
    });
  } catch (err) {
    next(new Error(err));
  }

};

exports.allSinEstado = async (req, res, next) => {

  const { query = {} } = req;

  try {
    const docs = await Model.find({})
      .populate('idRepresentante')
      .exec();

    const totalEstudiantes = await Model.countDocuments();

    res.json({
      success: true,
      ok: "allSinEstado",
      data: docs,
      totalEstudiantes
    });
  } catch (err) {
    next(new Error(err));
  }

};


exports.allSinLimite = async (req, res, next) => {
  const { query = {} } = req;
  try {
    const docs = await Model.find({ estado: 'Activo' })
      .populate('idRepresentante')
      .exec();

    const totalEstudiantes = await Model.countDocuments();
    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalEstudiantes
    });
  } catch (err) {
    next(new Error(err));
  }
};





exports.allByIdRepresentante = async (req, res, next) => {
  const { idRepresentante } = req.params;

  try {
    const docs = await Model.find({ idRepresentante })
      .populate('idRepresentante');

    res.json({
      success: true,
      ok: "all",
      data: docs
    });
  } catch (err) {
    next(new Error(err));
  }

};

exports.allByIdRepresentanteDesbloqueado = async (req, res, next) => {
  const { idRepresentante } = req.params;

  try {
    const docs = await Model.find({ idRepresentante }).populate('idRepresentante');

    res.json({
      success: true,
      ok: "all",
      data: docs
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
  console.log(doc);
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
