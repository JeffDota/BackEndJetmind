

const Model = require('./model');
const { paginar } = require('../../../utils');
const { singToken } = require('./../auth');


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
  console.log("_id", _id);
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
      .populate('addedUser', 'nombresApellidos tipo email estado')
      .populate('modifiedUser', 'nombresApellidos tipo email estado')
      .skip(skip).limit(limit)
      .sort({ '_id': -1 })
      .exec();

    const totalCiudades = await Model.countDocuments();

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalCiudades
    });
  } catch (err) {
    next(new Error(err));
  }

};
exports.allSinLimite = async (req, res, next) => {


  const { query = {} } = req;
  const { limit, page, skip } = paginar(query);


  try {
    const docs = await Model.find({})
      .populate('addedUser', 'nombresApellidos tipo email estado')
      .populate('modifiedUser', 'nombresApellidos tipo email estado')
      .sort({ '_id': -1 })
      .exec();

    const totalCiudades = await Model.countDocuments();

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalCiudades
    });
  } catch (err) {
    next(new Error(err));
  }

};

exports.allByIdHistorialEstudiante = async (req, res, next) => {
  const { idEstudiante } = req.params;

  const idEstudianteString = idEstudiante.toString();
  try {
    const docs = await Model.find({ 'idEstudiantes.0.item_id': idEstudianteString }).populate('idRepresentante');

    res.json({
      success: true,
      ok: "allByIdRepresentante",
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
