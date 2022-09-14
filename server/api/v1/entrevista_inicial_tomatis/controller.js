

const Model = require('./model');
const Role = require('../role/model');
const Persona = require('../persona/model');
const { paginar } = require('../../../utils');
const { singToken } = require('./../auth');


const Estudiante = require('./../estudiante/model');
const Representante = require('./../representante/model');
const Contrato = require('./../contrato/model');
const AsignarHorario = require('./../asignar_horario_estudiante/model');
const mongoose = require("mongoose");

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
  const { body = {}, decoded = {}, params = {} } = req;
  const { _id = null } = decoded;
  if (_id) {
    body.addedUser = _id;
  }
  Object.assign(body, params);
  const document = new Model(body);

  try {
    const doc = await document.save();


    /**
     * Envio de estudaintes a cada tabla de asignar horario
     */
    //verificar que el docente y el horario no esten asignados
    doc.estudiantes1.forEach(async (resp) => {
      resp.estudiantes.forEach(async (resp2) => {
        //verificar si existe el docente en asignar horario
        let asignarHorarioEstudiante = await AsignarHorario.findOne({
          $and: [{ idDocente: mongoose.Types.ObjectId(resp2.idDocente[0].item_id) },
          { idHorario: mongoose.Types.ObjectId(resp2.idHorario[0].item_id) }]
        });
        if (asignarHorarioEstudiante) {
          //si existen las dos coincidencias ingresar alumno a ese horario
          await asignarHorarioEstudiante.idEstudiantes.push(resp2.idEstudainte);
          await AsignarHorario.updateOne({ _id: asignarHorarioEstudiante._id }, asignarHorarioEstudiante);
          //TODO: notificar por correo al docente y director que fue agregado un nuevo estudiante a ese horario
        } else {
          //si no existe crear el en asignar horario con el docente el horario y el estudiante
          const asignarHorarioEstudiante = new AsignarHorario({
            estado: true,
            idDocente: mongoose.Types.ObjectId(resp2.idDocente[0].item_id),
            idHorario: mongoose.Types.ObjectId(resp2.idHorario[0].item_id),
            idEstudiantes: [resp2.idEstudainte]
          });
          await asignarHorarioEstudiante.save();
          //TODO: notificar por correo al docente y director que fue agregado un nuevo estudiante a ese horario
        }
      })
    });

    enviarCorreoPDFTM(doc);
    res.status(201);
    res.json({
      success: true,
      data: doc
    });
  } catch (err) {
    next(new Error(err));
  }
};


enviarCorreoPDFTM = async (doc) => {
  let estudiantesEntrevista = [];
  let docenteHorario = [];
  let asuntosTratados = [];
  const contrato = await Contrato.findOne({ _id: doc.idContrato });
  console.log(contrato);
  const representante = await Representante.findOne({ _id: contrato.idRepresentante });
  console.log(representante);

  doc.estudiantes1.forEach(async (resp) => {
    let estudiante = await Estudiante.findById(resp.estudiantes[0].idEstudainte);
    console.log('ESTUDINATE', estudiante);
    estudiantesEntrevista.push([
      resp.estudiantes[0].nombreEstudiante,
      estudiante.cedula,
      calcularEdad(estudiante.fechaNacimiento),
      resp.tiempoCapacitacion
    ]);
    asuntosTratados.push([
      resp.estudiantes[0].nombreEstudiante,
      resp.pregunta1,
      resp.pregunta2
    ]);
    resp.estudiantes.forEach(async (resp2) => {
      docenteHorario.push([
        resp.estudiantes[0].nombreEstudiante,
        resp2.idDocente[0].nombre,
        resp2.idHorario[0].nombre]);
    })

  });

  setTimeout(() => {
    const pdfDefinition = {

      content: [

        {
          image: path.join(__dirname, '../../../uploads/marcas/3f77e037-c883-4e7f-9a27-ea8f59521128.png'),
          width: 200,
          alignment: 'center',
        },
        '\n\n',
        {
          text: 'ENTREVISTA INICIAL TOMATIS',

          alignment: 'center',

        },
        '\n\n',
        {
          text: 'DATOS PERSONALES DEL ESTUDIANTE',

          alignment: 'center',
        },
        '\n\n',

        {
          columns: [
            {
              text: [
                { text: 'Nombre Representante: ' },
                `${representante.nombresApellidos}`,
              ]
            },
            {
              text: [
                { text: 'Cedula: ' },
                `${representante.cedula}`,
              ]
            },
          ]
        },
        '\n\n',
        {
          table: {
            body: [
              ['Nombre', 'Cedula', 'Edad', 'tiempoCapacitacion'],
              ...estudiantesEntrevista,
            ]
          }
        },
        '\n',
        {
          text: [
            { text: 'Dirección: ' },
            `${representante.direccion}`,
          ]
        },
        '\n\n',
        {
          text: 'ASUNTOS TRATADOS',

        },
        '\n\n',
        {

          table: {
            body: [
              ['Nombre', 'Recomendaciones del Especialista', 'Motivo de la Consulta'],
              ...asuntosTratados,
            ]
          }
        },
        '\n\n',
        {
          text: 'HORARIOS ASIGNADOS',

        },
        '\n\n',
        {

          table: {
            body: [
              ['Estudiante', 'Docente', 'Horario'],
              ...docenteHorario
            ]
          }
        },
        '\n\n',

        {
          text: 'ACUERDOS',

        },
        '\n\n',
        {
          text: '1.- Puntualidad: Llegar 5 minutos antes del horario establecido\n 2.- La asistencia debe ser constante y continua durante 13 días de Lunes a Vierne - Reforzar en casa\n 3.- No hay Modificación de Horarios\n 4.- El cierre de Fase será vía Online\n 5.- Si el Paciente se encuentra con dificultades de salud por favor que no asista. (Se debe presentar el certificado médico para recuperar la inasistencia\n 6.- Si tiene 3 inasistencias seguidas se cancela la fase\n 7.- Para salvaguardar la seguridad de todos, el aforo del centro es limitado, solo podrán ingresar los especialistas y los paciente'
        }

      ]

    }



    const pdfDoc = printer.createPdfKitDocument(pdfDefinition);
    pdfDoc.pipe(fs.createWriteStream(`EntrevistaIncialTM-${contrato.codigo}.pdf`));
    pdfDoc.end();

  }, 500);


  setTimeout(async () => {
    console.log('entre envio correo correo Entrevista Incial');
    //Enviar correo electronico al representante
    const esperar = await envioEmail.transporter.sendMail({
      from: USER_EMAIL,
      to: ['davidtamayoromo@gmail.com', representante.email],
      subject: `ENTREVISTA INICIAL |  ${contrato.codigo}`,
      html: `<div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:16px\">
      <span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">
      Estimado/a; ${representante.nombresApellidos} </span></span><br></div>
      <div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:16px\">
      <span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">
      Se adjunta en este correo electronico
      la entrevista inicial realizada para el programa adquirido.<br></span></span>
      </div><div><br></div><div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:13.3333px\">
      <span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">
      Nota: Este es un correo automático, por favor no responder. Si tiene alguna duda o pregunta, 
      comunicarse con su director academico para que éste le ayude con su solicitud.</span></span><br></div>`,
      attachments: [
        {
          filename: `EntrevistaIncialTM-${contrato.codigo}.pdf`,
          path: path.join(__dirname, `../../../../EntrevistaIncialTM-${contrato.codigo}.pdf`),
          contentType: 'application/pdf'
        }
      ]
    })
    if (esperar != null) {
      console.log('Esperando');
    } else {
      console.log('Enviado');
    }
  }, 2500);

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



exports.all = async (req, res, next) => {
  const { query = {}, decoded = {} } = req;
  const { _id = null } = decoded;
  const { limit, page, skip } = paginar(query);

  const persona = await Persona.findOne({ "_id": _id });
  const role = await Role.findOne({ "_id": { $in: persona.tipo } });


  try {
    let docs;
    if (role.nombre.includes('Super')) {
      docs = await Model.aggregate([
        {
          $lookup: {
            from: 'personas',
            localField: 'addedUser',
            foreignField: '_id',
            as: 'addedUser'
          }
        },
        {
          $unwind: {
            path: '$addedUser',
          }
        },
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
            from: 'representantes',
            localField: 'idContrato.idRepresentante',
            foreignField: '_id',
            as: 'idRepresentante'
          }
        },
        {
          $unwind: {
            path: '$idRepresentante',
          }
        },
      ])
        .skip(skip).limit(limit)
        .sort({ '_id': -1 })
        .exec();
    } else if (role.nombre.includes('Admin')) {
      docs = await Model.aggregate([
        {
          $lookup: {
            from: 'personas',
            localField: 'addedUser',
            foreignField: '_id',
            as: 'addedUser'
          }
        },
        {
          $unwind: {
            path: '$addedUser',
          }
        },
        {
          $match: {
            $and: [
              { 'addedUser.idCiudad': { $in: persona.idCiudad } },
            ]
          }
        },
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
            from: 'representantes',
            localField: 'idContrato.idRepresentante',
            foreignField: '_id',
            as: 'idRepresentante'
          }
        },
        {
          $unwind: {
            path: '$idRepresentante',
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
