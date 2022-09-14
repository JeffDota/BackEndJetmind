

const Model = require('./model');
const Role = require('../role/model');
const Persona = require('../persona/model');
const { paginar } = require('../../../utils');
const { singToken } = require('../auth');

const Estudiante = require('./../estudiante/model');
const Representante = require('./../representante/model');
const Contrato = require('./../contrato/model');

const fonts = {
  Roboto: {
    normal: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64')
  }
}
const PdfPrinter = require('pdfmake');
const printer = new PdfPrinter(fonts);
const pdfmake = require('pdfmake');

const path = require('path');

const { v4 } = require('uuid');
const fs = require('fs');

const envioEmail = require('../../../email');
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

exports.create = async (req, res, next) => {
  const { body = {} } = req;
  const document = new Model(body);

  try {
    const doc = await document.save();
    setTimeout(() => {
      enviarPdfCH18(doc);
    }, 1000);
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
    if (role.nombre.includes('Super')) {
      docs = await Model.find({})
        .populate('idContrato')
        .populate('idEstudiante')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .skip(skip).limit(limit)
        .sort({ '_id': -1 })
        .exec();
    } else if (role.nombre.includes('Admin')) {
      docs = await Model.aggregate([
        {
          $lookup: {
            from: 'contratos',
            localField: 'idContrato',
            foreignField: '_id',
            as: 'idContrato'
          }
        },
        {
          $unwind: {
            path: '$idContrato',
          }
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'idContrato.addedUser',
            foreignField: '_id',
            as: 'persona'
          }
        },
        {
          $unwind: {
            path: '$persona',
          }
        },
        {
          $match: {
            'persona.idCiudad': { $in: persona.idCiudad }
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
            path: '$idEstudiante',
          }
        },

      ])
        .skip(skip).limit(limit)
        .sort({ '_id': -1 })
        .exec();
    }
    res.json({
      success: true,
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



enviarPdfCH18 = async (doc) => {

  const contrato = await Contrato.findOne({ _id: doc.idContrato });
  const representante = await Representante.findOne({ _id: contrato.idRepresentante });
  const estudiante = await Estudiante.findOne({ _id: doc.idEstudiante });

  let arrayDeParentesco = [];
  doc.pregunta5.forEach(element => {
    arrayDeParentesco.push([element.parentesco, element.nombre, element.edad, element.ocupacion]);
  });
  setTimeout(async () => {

    const pdfDefinition = {

      content: [
        {
          image: path.join(__dirname, '../../../uploads/marcas/d89863d0-f162-4615-b005-c58bdd82648f.png'),
          width: 200,
          alignment: 'center',
        },
        '\n\n',
        {
          text: [
            { text: 'Estimado padre de familia, le recordamos que esta información es de carácter confidencial y que todo lo que usted escriba aquí, se manejará de forma ética y profesional ya que nos servirá como apoyo en las necesidades que se requieran en la capacitación de su representado.' },
            `${estudiante.nombresApellidos}`,
          ]
        },
        '\n\n',
        {
          text: 'DATOS PERSONALES DEL ESTUDIANTE',

          alignment: 'center',

        },
        '\n\n',
        {
          text: [
            { text: 'Nombre: ' },
            `${estudiante.nombresApellidos}`,
          ]
        },
        '\n',
        {
          columns: [

            {
              text: [
                { text: 'Edad: ' },
                `${calcularEdad(estudiante.fechaNacimiento)}`,
              ]
            },
            {
              text: [
                { text: 'Fecha de Nacimiento: ' },
                `${estudiante.fechaNacimiento}`,
              ]
            },
          ]
        },
        '\n',
        {
          text: [
            { text: 'Dirección: ' },
            `${representante.direccion}`,
          ]
        },
        '\n',
        {
          columns: [

            {
              text: [
                { text: 'Lugar de nacimiento: ' },
                `${doc.pregunta1}`,
              ]
            },
            {
              text: [
                { text: 'Redes sociales (estudiante - representante) : ' },
                `${doc.pregunta2}`,
              ]
            },
          ]
        },
        '\n\n',
        {
          text: '1.- HISTORIA FAMILIAR Y PERSONAL',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PARENTESCO', 'NOMBRE', 'EDAD', 'OCUPACIÓN'],
              ...arrayDeParentesco
            ]
          }
        },
        '\n',
        {
          text: [
            { text: 'Estado civil de los padres: ' },
            `${doc.pregunta6}`,
          ]
        },
        '\n',
        {
          text: [
            { text: 'Con quien prectica usted ingles: ' },
            `${doc.pregunta7}`,
          ]
        },
        '\n\n',
        {
          text: '2.- SALUD'
        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA', 'OBSERVACIONES'],
              ['¿Tiene alguna dificultad visual? ', `${doc.pregunta8.respuesta}`, `${doc.pregunta8.observacion}`],
              ['¿Se ha practicado alguna vez exámenes auditivos? ', `${doc.pregunta9.respuesta}`, `${doc.pregunta9.observacion}`],
              ['¿Se ha practicado alguna vez exámenes visuales? ', `${doc.pregunta10.respuesta}`, `${doc.pregunta10.observacion}`],

            ]
          }
        },
        '\n\n',
        {
          text: '3.- LABORAL'
        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['Principales funciones ', `${doc.pregunta11}`],
              ['Jornada Laboral (Especificar Horarios) ', `${doc.pregunta12}`],
            ]
          }
        },
        '\n\n',
        {
          text: '4.- ACUERDOS'
        },
        '\n\n',
        {
          text: [
            { text: 'Mencione los acuerdos establecidos con su Consultor Educativo' },
            `${doc.pregunta13}`,
          ]
        },

      ]

    }
    const pdfDoc = printer.createPdfKitDocument(pdfDefinition);
    pdfDoc.pipe(fs.createWriteStream(`PEEA-CH-18-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`));
    pdfDoc.end();
  }, 2500);

  setTimeout(async () => {
    const esperar = await envioEmail.transporter.sendMail({
      from: USER_EMAIL,
      to: ['davidtamayoromo@gmail.com', representante.email],
      subject: `PEEA CHARLOTTE 18 |  ${contrato.codigo} | ${estudiante.nombresApellidos}`,
      html: `<div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:16px\">
      <span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">
      Estimado/a; ${representante.nombresApellidos} </span></span><br></div>
      <div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:16px\">
      <span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">
      Se adjunta en este correo electronico
      el PEEA realizado para completar el proceso de ingreso.<br></span></span>
      </div><div><br></div><div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:13.3333px\">
      <span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">
      Nota: Este es un correo automático, por favor no responder. Si tiene alguna duda o pregunta, 
      comunicarse con su director academico para que éste le ayude con su solicitud.</span></span><br></div>`,
      attachments: [
        {
          filename: `PEEA-CH-18-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`,
          path: path.join(__dirname, `../../../../PEEA-CH-18-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`),
          contentType: 'application/pdf'
        }
      ]
    })
    if (esperar != null) {
      console.log('Esperando');
    } else {
      console.log('Enviado');
    }
  }, 3500);
}



calcularEdad = (fecha) => {
  var hoy = new Date();
  var cumpleanos = new Date(fecha);
  var edad = hoy.getFullYear() - cumpleanos.getFullYear();
  var m = hoy.getMonth() - cumpleanos.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
    edad--;
  }

  return edad;
}

