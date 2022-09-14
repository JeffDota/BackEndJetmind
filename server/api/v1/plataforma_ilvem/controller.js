

const Model = require('./model');
const Role = require('../role/model');
const Persona = require('../persona/model');
const Estudiante = require('../estudiante/model');
const { paginar } = require('../../../utils');
const { singToken } = require('./../auth');

const { USER_EMAIL } = process.env;
const envioEmail = require('../../../email');

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
    const estudiante = await Estudiante.findOne({ "_id": doc.idEstudiante });
    const esperar = await envioEmail.transporter.sendMail({
      from: USER_EMAIL,
      to: ['davidtamayoromo@gmail.com', estudiante.email],
      subject: "Plataforma educativa Online",
      html: `<div style='background: #c2c2c2;'> <div style='height: 50px;'></div> 
      <div style='background-image: url("https://ilvemecuador.com/wp-content/uploads/2021/10/David-3_Mesa-de-trabajo-1-copia-2.png"); 
      width: 700px; height: 500px; background-size: 100% 100%; background-repeat: no-repeat; 
      background-position: center center; margin: auto; color: aliceblue;'> 
      <div style='height: 190px;'></div> <h3 style='text-align: center; font-family: gilroy'> 
      <a style='color: #FF4800;' href='https://plataforma.ilvemecuador.com'>https://plataforma.ilvemecuador.com</a>
       </h3> <h2 style='text-align: center; font-family: gilroy; color:#ffffff;'>Correo electronico: ${estudiante.email}
       </h2> <h2 style='text-align: center; font-family: gilroy; color: #ffffff;'>Contraseña: ${doc.password}</h2> 
       <br> <h3 style='text-align: center; font-family: gilroy; color: #ffffff;'>
       Te damos la más cordial bienvenida a nuestra plataforma educativa.</h3> 
       <h3 style='text-align: center; font-family: gilroy ;color:#ff4800'> 
       Nota: Revisa tu correo electrónico para activar el acceso a la plataforma virtual.</h3> </div></div>`
    });

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


  const { decoded = {}, query } = req;
  const { _id = null } = decoded;

  const persona = await Persona.findOne({ "_id": _id });
  const role = await Role.findOne({ "_id": { $in: persona.tipo } });
  const { limit, page, skip } = paginar(query);


  try {
    let docs;
    if (role.nombre.includes('Super')) {
      docs = await Model.find({})
        .populate('idEstudiante')
        .populate('idDirector')
        .populate('idDocente')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .skip(skip).limit(limit)
        .sort({ '_id': -1 })
        .exec();
    } else if (role.nombre.includes('Admin')) {
      docs = await Model.aggregate([
        {
          $lookup: {
            from: 'personas',
            localField: 'idDirector',
            foreignField: '_id',
            as: 'idDirector'
          }
        },
        {
          $unwind: {
            path: '$idDirector'
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
          $unwind: {
            path: '$idDocente'
          }
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
          $unwind: {
            path: '$idEstudiante'
          }
        }
      ])
    }
    res.json({
      success: true,
      data: docs,
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
