

const Model = require('./model');
const Role = require('../role/model');
const { paginar } = require('../../../utils');


const { fields } = require('./model');
const { verify } = require('jsonwebtoken');
const { signToken } = require('./../auth');

const envioEmail = require('../../../email');

const mongoose = require("mongoose");
const { getMenuFrontEnd } = require('../../../helper/menu');

const { USER_EMAIL } = process.env;

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

exports.signup = async (req, res, next) => {
  const { body = {} } = req;
  const document = new Model(body);
  try {
    const doc = await document.save();
    const { _id } = doc;
    const token = signToken({ _id });
    res.status(201);

    res.json({
      success: true,
      data: doc,
      meta: { token }
    });
  } catch (error) {
    next(new Error(error));
  }
}
/**
 * ================================================================
 * LOGIN
 * ================================================================
 */
exports.signin = async (req, res, next) => {
  const { body = {} } = req;
  const { email = '', password = '' } = body;
  try {
    const user = await Model.findOne({
      $and: [
        { email },
        { estado: 'Activo' }
      ]
    }).exec();
    if (!user) {
      const message = 'Contraseña o email no valido';
      return next({
        success: false,
        message,
        statusCode: 401,
        level: 'info',
      });
    }
    const verified = await user.verifyPassword(password);
    if (!verified) {
      const message = 'Contraseña o email no valido';
      return next({
        success: false,
        message,
        statusCode: 401,
        level: 'info',
      });
    }

    const { _id } = user;
    const token = signToken({ _id });


    const menu = await Role.findById(user.tipo[0]);
    let menuFrontEnd = await getMenuFrontEnd(menu.nombre);
    return res.json({
      success: true,
      ok: "singin",
      data: user,
      meta: { token },
      menuFrontEnd,
      role: menu.nombre
    });

  } catch (error) {
    return next(new Error(error));
  }
}
/**
 * ==================================================
 * Renovar Token
 * ================================================== 
 */
exports.renewToken = async (req, res) => {
  const { decoded } = req;
  const { _id } = decoded;

  // Generar el TOKEN - JWT
  const token = await signToken({ _id });

  // Obtener el usuario por id
  const usuario = await Model.findById(_id);


  res.json({
    success: true,
    ok: "singin",
    data: usuario,
    meta: { token }
  });


}



/**
 *==================================================
 * Crear Persona
 *==================================================
 */
exports.create = async (req, res, next) => {
  const { body = {}, params = {}, decoded = {} } = req;
  const { _id = null } = decoded;
  console.log("ID:" + _id);
  const { email } = body;

  if (_id) {
    body.addedUser = _id;
  }

  Object.assign(body, params);

  const document = new Model(body);

  try {
    const existeEmail = await Model.findOne({ email });
    if (existeEmail) {
      return res.status(400).json({
        success: false,
        message: 'El correo electronico ya existe'
      });
    }
    const doc = await document.save();
    await enviarCorreoPersona(doc);
    res.status(201);
    res.json({
      success: true,
      ok: "create",
      data: doc
    });




  } catch (err) {
    next(new Error(err));
  }
};

enviarCorreoPersona = async (persona) => {
  /** Envio de correo de verificacion */
  setTimeout(async () => {
    const enviar = await envioEmail.transporter.sendMail({
      from: USER_EMAIL,
      //TODO: cambiar el correo al q va a llegar
      to: ['davidtamayoromo@gmail.com', persona.email],
      subject: 'Corporacion JETMIND',
      //TODO: poner la ruta global del servidor www.dominio.com/password/doc.id
      html: `<h1>Hola ${persona.nombresApellidos}</h1><span>Bienvenido/a, te hemos agregado al sistema empresarial, necesitamos primero generar tu clave personal para ingresar al sistema.</span><br><br><a href='https://app.corporacionjetmind.com/password/${persona._id}'><button type="button">Click Aqui!</button></a>`
    })
    console.log('CORREO creacion persona', enviar);
  }, 2500);
}

exports.recuperarPassword = async (req, res, next) => {
  const { email } = req.params;
  try {
    const doc = await Model.findOne({ 'email': email });
    if (doc) {
      const esperar = await envioEmail.transporter.sendMail({
        from: USER_EMAIL,
        to: ['davidtamayoromo@gmail.com', doc.email],
        subject: "Recuperar Contraseña",
        //TODO: poner la ruta global del servidor www.dominio.com/password/doc.id
        html: `<h1>Hola ${doc.nombresApellidos}</h1><span> Haz clic en el siguiente boton para restablecer tu contraseña</span><br><br><a href='https://app.corporacionjetmind.com/password/${doc._id}'><button type="button">Click Aqui!</button></a>`
      });

      if (esperar != null) {
        console.log('Esperando');
      } else {
        console.log('Enviado');
      }
    }
    res.json({
      success: true,
      ok: "Password actualizado",
    });

  } catch (err) {
    next(new Error(err));
  }
};
exports.enviar = async (req, res, next) => {
  try {
    for (let index = 1; index < 10; index++) {
      //con await esperamos la respuesta del envio del email
      const esperar = await envioEmail.transporter.sendMail({
        from: USER_EMAIL,
        to: 'davidtamayoromo@gmail.com',
        subject: "Prueba email NODEJS" + index,
      });

      /* envioEmail.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
      }); */

      //If necesario para esperar la respuesta del envio del email
      if (esperar != null) {
        console.log('Esperando');
      } else {
        console.log('Enviado');
      }
      console.log("Epoch: " + index);
    }
  } catch (err) {
    next(new Error(err));
  }
};



exports.allSinLimite = async (req, res, next) => {
  const { query = {} } = req;
  const { limit, page, skip } = paginar(query);


  try {

    const docs = await Model.find({})
      .populate('idCiudad')
      .populate('idMarca')
      .populate('idSucursal')
      .populate('tipo')
      .sort({ '_id': -1 })
      .exec();
    const totalUsuarios = await Model.countDocuments();

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalUsuarios
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
      .populate('idCiudad')
      .populate('idMarca')
      .populate('idSucursal')
      .populate('tipo')
      .skip(skip).limit(limit)
      .sort({ '_id': -1 })
      .exec();
    const totalUsuarios = await Model.countDocuments();

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalUsuarios
    });

  } catch (err) {
    next(new Error(err));
  }

};

exports.allByRoleCiudadMarca = async (req, res, next) => {
  const { query = {} } = req;
  const { limit, page, skip } = paginar(query);
  const { role, ciudad, marca } = req.params;

  try {

    const docs = await Model.find({ tipo: role, idCiudad: ciudad, idMarca: marca })
      .populate('idCiudad')
      .populate('idMarca')
      .populate('idSucursal')
      .populate('tipo')
      .sort({ '_id': -1 })
      .exec();

    res.json({
      success: true,
      ok: "allByRole",
      data: docs
    });

  } catch (err) {
    next(new Error(err));
  }

};

exports.allByRoleCiudadMarca2 = async (req, res, next) => {
  const { query = {} } = req;
  const { limit, page, skip } = paginar(query);
  const { role, ciudad, marca } = req.params;

  //Para obteneer los elementos de un string separados por comas
  let arrayCiudad = ciudad.split(',');
  let arrayCiudadObjectID = [];
  arrayCiudad.map(x => arrayCiudadObjectID.push(mongoose.Types.ObjectId(x)));

  try {
    const docs = await Model.find({ tipo: role, idCiudad: { $in: arrayCiudadObjectID }, idMarca: marca })
      .populate('idCiudad')
      .populate('idMarca')
      .populate('idSucursal')
      .populate('tipo')
      .sort({ '_id': -1 })
      .exec();

    res.json({
      success: true,
      ok: "allByRole",
      data: docs
    });

  } catch (err) {
    next(new Error(err));
  }

};

exports.allByCiudadMarca = async (req, res, next) => {
  const { query = {}, decoded = {} } = req;
  console.log('DECODEDE', decoded);
  const { _id = null } = decoded;
  const persona = await Model.findOne({ "_id": _id });

  const role = await Role.findOne({ "_id": { $in: persona.tipo } });
  try {

    let docs;
    if (role.nombre.includes('Super')) {
      docs = await Model.find({})
        .populate('idCiudad')
        .populate('idMarca')
        .populate('idSucursal')
        .populate('tipo')
        .sort({ '_id': -1 })
        .exec();
    } else if (role.nombre.includes('Admin')) {
      docs = await Model.find({
        $and: [
          { idCiudad: { $in: persona.idCiudad } },
          { idMarca: { $in: persona.idMarca } }
        ]
      })
        .populate('idCiudad')
        .populate('idMarca')
        .populate('idSucursal')
        .populate('tipo')
        .sort({ '_id': -1 })
        .exec();
    } else if (role.nombre.includes('Docente')) {
      docs = await Model.find({ _id: persona._id })
        .populate('idCiudad')
        .populate('idMarca')
        .populate('idSucursal')
        .populate('tipo')
        .sort({ '_id': -1 })
        .exec();
    }

    res.json({
      success: true,
      ok: "allByRole",
      data: docs
    });

  } catch (err) {
    next(new Error(err));
  }

};

exports.read = async (req, res, next) => {
  const { doc = {} } = await req;

  res.json({
    success: true,
    ok: "read",
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
      ok: "update",
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
      ok: "delete",
      data: removed
    });
  } catch (error) {
    next(new Error(error));
  }
};
