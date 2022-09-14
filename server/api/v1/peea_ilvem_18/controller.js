

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
      enviarPdfIL18(doc);
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
    let totalPeea18ilvem;
    if (role.nombre.includes('Super')) {
      docs = await Model.find({})
        .populate('idContrato')
        .populate('idEstudiante')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .skip(skip).limit(limit)
        .sort({ '_id': -1 })
        .exec();
      totalPeea18ilvem = await Model.countDocuments({});
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
      totalPeea18ilvem = await Model.countDocuments({});
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


enviarPdfIL18 = async (doc) => {

  const contrato = await Contrato.findOne({ _id: doc.idContrato });
  const representante = await Representante.findOne({ _id: contrato.idRepresentante });
  const estudiante = await Estudiante.findOne({ _id: doc.idEstudiante });

  let arrayDeParentesco = [];
  doc.pregunta9.forEach(element => {
    arrayDeParentesco.push([element.parentesco, element.nombre, element.edad, element.ocupacion]);
  });
  setTimeout(async () => {

    const pdfDefinition = {

      content: [
        {
          image: path.join(__dirname, '../../../uploads/marcas/32599b2c-1b94-49c9-8332-253230a7d579.png'),
          width: 200,
          alignment: 'center',
        },
        '\n\n',
        {
          text: 'DATOS PERSONALES ',
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
          columns: [

            {
              text: [
                { text: 'Dirección: ' },
                `${representante.direccion}`,
              ]

            }
          ]
        },
        '\n',
        {
          columns: [
            {
              text: [
                { text: 'Lugar de Nacimiento: ' },
                `${doc.pregunta1}`,
              ]
            },
            {
              text: [
                { text: 'Email: ' },
                `${representante.email}`,
              ]
            },

          ]
        },
        '\n',
        {
          columns: [
            {
              text: [
                { text: 'Ocupación: ' },
                `${doc.pregunta4}`,
              ]
            },
            {
              text: [
                { text: 'Empresa donde trabaja: ' },
                `${doc.pregunta5}`,
              ]
            },

          ]
        },
        '\n',
        {
          columns: [
            {
              text: [
                { text: 'Celular: ' },
                `${representante.telefono}`,
              ]
            },
            {
              text: [
                { text: 'Como le encontramos en Facebook?: ' },
                `${doc.pregunta2}`,
              ]
            },
          ]
        },
        '\n\n',
        {
          columns: [

            {
              text: [
                { text: 'Forma de Pago del programa ILVEM: ' },
                `${contrato.formaPago}`,
              ]
            },
            {
              text: [
                { text: 'Valor Invertido: ' },
                `${contrato.valorTotal}`,
              ]
            },
          ]
        },
        '\n\n',
        {
          text: 'Describa a continuación su expectativa Personal, al realizar la capacitación en el Programa de ILVEM :'

        },
        '\n',
        {
          text: `${doc.pregunta3}`,
        },

        '\n\n',
        {
          text: '1.- DATOS FAMILIARES',

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
        '\n\n',
        {
          text: 'Describa cómo es la relación con su pareja: (En caso de tenerlo):',

        },
        '\n',
        {
          text: `${doc.pregunta10}`,
        },
        '\n\n',
        {
          text: 'Describa cómo es la relación con sus hijos/as: (En caso de tenerlo):',

        },
        '\n',
        {
          text: `${doc.pregunta11}`,

        },
        '\n\n',
        {
          text: 'Describa cómo es la relación con su madre:',

        },
        '\n',
        {
          text: `${doc.pregunta12}`,

        },
        '\n\n',
        {
          text: 'Describa cómo es la relación con su padre:',

        },
        '\n',
        {
          text: `${doc.pregunta13}`,

        },
        '\n\n',
        {
          text: 'Describa cómo es la relación con sus hermanos/as:',

        },
        '\n',
        {
          text: `${doc.pregunta14}`,

        },
        '\n\n',
        {
          text: '¿Ha experimentado algún evento representativo en los últimos dos años?:',

        },
        '\n',
        {
          text: `${doc.pregunta15.respuesta}`,

        },
        '\n',
        {
          text: `${doc.pregunta15.observacion}`,

        },
        '\n\n',
        {
          text: '2.- SALUD',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA', 'OBSERVACIONES'],
              ['¿Presenta usted alguna dificultad auditiva?', `${doc.pregunta16.respuesta}`, `${doc.pregunta16.observacion}`],
              ['¿Presenta usted alguna dificultad de salud?', `${doc.pregunta17.respuesta}`, `${doc.pregunta17.observacion}`],
              ['¿Presenta usted alguna dificultad visual? ', `${doc.pregunta18.respuesta}`, `${doc.pregunta18.observacion}`],
              ['¿Presenta usted alguna dificultad visual? ', `${doc.pregunta19.respuesta}`, `${doc.pregunta19.observacion}`],
              ['Describa su estado de salud actual del 1 al 10 ', `${doc.pregunta20}`, ``],
              ['¿Está usted o ha estado alguna vez en tratamiento con las siguientes especialidades médicas?', `${doc.pregunta21.respuesta}`, `${doc.pregunta21.observacion}`],
              ['¿Está usted cumpliendo algún tratamiento médico en este momento?', `${doc.pregunta22.respuesta}`, `${doc.pregunta22.observacion}`],
              ['¿Cuántas horas duerme como promedio por las noches?', `Desde: ${doc.pregunta23.desde} - Hasta: ${doc.pregunta23.hasta}`, ``],

            ]
          }
        },
        '\n\n',
        {
          text: '3.- LABORAL',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA', 'OBSERVACIONES'],
              ['¿Trabaja?', `${doc.pregunta24.respuesta}`, `${doc.pregunta24.observacion}`],
              ['Principales funciones', `${doc.pregunta25}`, ``],
              ['Jornada Laboral (Especificar Horarios)', `${doc.pregunta26}`, ``],
              ['¿Es distraído?', `${doc.pregunta27}`, ``],
              ['Jornada Laboral (Especificar Horarios)', `${doc.pregunta26}`, ``],
              [' ¿Hace amigos fácilmente?', `${doc.pregunta28}`, ``],
              ['¿Alcanza sus metas u objetivos?', `${doc.pregunta29}`, ``],
              ['¿Se le dificulta seguir órdenes?', `${doc.pregunta30}`, ``],
              ['¿Tiene dificultad para controlar sus emociones?', `${doc.pregunta31}`, ``],
              ['¿Se desilusiona fácilmente cuando algo no le sale bien?', `${doc.pregunta32}`, ``],
              ['¿Es una persona organizada?', `${doc.pregunta33}`, ``],
              ['¿Tiene usted miedo escénico?', `${doc.pregunta34}`, ``],
              ['¿Tiene usted miedo escénico?', `${doc.pregunta34}`, ``],

            ]
          }
        },
        '\n\n',
        {
          text: 'Mencione los acuerdos establecidos con su Consultor Educativo:',

        },
        '\n',
        {
          text: `${doc.pregunta35}`,

        },
        '\n\n',
        {
          text: '¿A través de quién o qué medio, conoció nuestro Programa?',

        },
        '\n',
        {
          text: `${doc.pregunta36}`,

        },
      ]

    }
    const pdfDoc = printer.createPdfKitDocument(pdfDefinition);
    pdfDoc.pipe(fs.createWriteStream(`PEEA-IL-18-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`));
    pdfDoc.end();
  }, 2500);

  setTimeout(async () => {
    const esperar = await envioEmail.transporter.sendMail({
      from: USER_EMAIL,
      to: ['davidtamayoromo@gmail.com', representante.email],
      subject: `PEEA ILVEM 18|  ${contrato.codigo} | ${estudiante.nombresApellidos}`,
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
          filename: `PEEA-IL-18-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`,
          path: path.join(__dirname, `../../../../PEEA-IL-18-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`),
          contentType: 'application/pdf'
        }
      ]
    })
    if (esperar != null) {
      console.log('Esperando');
    } else {
      console.log('Enviado');
    }
  }, 3500)
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
