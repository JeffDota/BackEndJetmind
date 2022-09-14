

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
      enviarPdfTM18(doc);
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



enviarPdfTM18 = async (doc) => {

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
          image: path.join(__dirname, '../../../uploads/marcas/3f77e037-c883-4e7f-9a27-ea8f59521128.png'),
          width: 200,
          alignment: 'center',
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
          columns: [
            {
              text: [
                { text: 'Fecha de Nacimiento: ' },
                `${estudiante.fechaNacimiento}`,
              ]
            },
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
                { text: 'Celular: ' },
                `${representante.telefono}`,
              ]
            },
            {
              text: [
                { text: 'Redes sociales (estudiante - representante): ' },
                `${doc.pregunta2}`,
              ]
            },
          ]
        },
        '\n',
        {
          text: [
            { text: 'Motivo de consulta ' },
            `${doc.pregunta8}`,
          ]
        },
        '\n',
        {
          text: [
            { text: 'Diagnóstico Médico ' },
            `${doc.pregunta6}`,
          ]
        },
        '\n\n',
        {
          text: [
            { text: 'Recibe alguna terapia ' },
            `${doc.pregunta7}`,
          ]
        },
        '\n\n',
        {
          text: '1.- ESTRUCTURA FAMILIAR',
          style: 'header',

        },

        '\n\n',
        {
          style: 'tableExample',
          table: {
            body: [
              ['PARENTESCO', 'NOMBRE', 'EDAD', 'OCUPACIÓN'],
              ...arrayDeParentesco
            ]
          }
        },
        '\n\n',
        {
          text: [
            { text: 'Describa cómo es la relación con su cónyuge o pareja: (En caso de tenerlo)' },
            `${doc.pregunta10}`,
          ]
        },
        '\n\n',
        {
          text: [
            { text: 'Describa cómo es la relación con sus hijos/as: (En caso de tenerlo)' },
            `${doc.pregunta11}`,
          ]
        },
        '\n\n',
        {
          text: [
            { text: 'Describa cómo fue la relación con sus padres' },
            `${doc.pregunta12}`,
          ]
        },
        '\n',
        {
          text: 'ETAPA DE NIÑEZ',

        },
        '\n',
        {
          text: [
            { text: 'Describa cómo fue la relación con sus hermanos/as' },
            `${doc.pregunta13}`,
          ]
        },
        '\n\n',
        {
          text: [
            { text: 'Describa cómo es la relación con sus padres' },
            `${doc.pregunta14}`,
          ]
        },
        '\n',
        {
          text: 'ETAPA ACTUAL',

        },
        '\n\n',
        {
          text: [
            { text: '¿Ha experimentado algún evento representativo en los últimos dos años?' },
            `${doc.pregunta15}`,
          ]
        },
        '\n\n',
        {
          text: [
            { text: '¿Ha experimentado algún evento representativo en los últimos dos años?' },
            `${doc.pregunta16}`,
          ]
        },
        '\n',
        {
          text: 'SALUD',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['¿Su estado de salud actual es satisfactorio', `${doc.pregunta17}`],
              ['¿Se ha practicado alguna vez exámenes auditivos?', `${doc.pregunta18}`],
              ['¿Tiene usted pérdida auditiva?', `${doc.pregunta19}`],
              ['¿Está usted cumpliendo algún tratamiento médico en este momento?', `${doc.pregunta22}`],
              ['Actividad física', `${doc.pregunta23}`],
              ['Tiempo de sueño', `${doc.pregunta24}`],
              ['¿Tiene usted algún historial de desorden emocional o de comportamiento?', `${doc.pregunta25}`],
              ['¿Algún familiar tiene historial de desorden emocional o de comportamiento?', `${doc.pregunta26}`],

            ]
          }
        },
        '\n\n',
        {
          text: 'ORGANIZACIÓN/ATENCIÓN Y CONOCIMIENTO',

          alignment: 'center',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['¿Es distraído?', `${doc.pregunta27}`],
              ['¿Tiene excesiva actividad física?', `${doc.pregunta28}`],
              ['¿Tiene dificultad para controlar sus emociones?', `${doc.pregunta29}`],
              ['¿Se desilusiona fácilmente cuando algo no le sale bien?', `${doc.pregunta30}`],
              ['¿Es una persona organizada?', `${doc.pregunta31}`],
              ['¿Es usted una persona sensible?', `${doc.pregunta32}`],
              ['¿Tiene tics nerviosos?', `${doc.pregunta33}`],
              ['¿Tiene miedo escénico?', `${doc.pregunta34}`],
              ['¿Tiene gran sensibilidad al tacto?', `${doc.pregunta35}`],
              ['¿Tiene corto tiempo de atención?', `${doc.pregunta36}`],
              ['¿Hace amigos fácilmente?', `${doc.pregunta37}`],
              ['¿Alcanza sus metas u objetivos?', `${doc.pregunta38}`],
              ['¿Se le dificulta seguir órdenes?', `${doc.pregunta39}`],
              ['¿Dificultad para conciliar el sueño?', `${doc.pregunta40}`],
              ['Tiene fobias?', `${doc.pregunta41}`],
              ['¿Tiene tolerancia al dolor?', `${doc.pregunta42}`],
              ['¿Posee gran sensibilidad a los olores?', `${doc.pregunta43}`],
            ]
          }
        },
        '\n\n',
        /* {
          text: 'Ha sufrido o sufre alguno de estos padecimientos de manera frecuente',
          style: 'header',
          alignment: 'center',
          color: '#1c3661',
          bold: true
        }, */
        '\n\n',


      ]

    }
    const pdfDoc = printer.createPdfKitDocument(pdfDefinition);
    pdfDoc.pipe(fs.createWriteStream(`PEEA-TM-18-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`));
    pdfDoc.end();
  }, 2500);

  setTimeout(async () => {
    const esperar = await envioEmail.transporter.sendMail({
      from: USER_EMAIL,
      to: ['davidtamayoromo@gmail.com', representante.email],
      subject: `PEEA TOMATIS 18|  ${contrato.codigo} | ${estudiante.nombresApellidos}`,
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
          filename: `PEEA-TM-18-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`,
          path: path.join(__dirname, `../../../../PEEA-TM-18-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`),
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
