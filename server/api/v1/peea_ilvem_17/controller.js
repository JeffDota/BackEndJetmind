

const Model = require('./model');
const Role = require('../role/model');
const Persona = require('../persona/model');
const { paginar } = require('../../../utils');
const { singToken } = require('../auth');


const { fields } = require('./model');

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
      enviarPdfIL17(doc);
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
    const totalPeea17ilvem = await Model.countDocuments({});

    res.json({
      success: true,
      data: docs,
      totalPeea17ilvem
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


enviarPdfIL17 = async (doc) => {

  const contrato = await Contrato.findOne({ _id: doc.idContrato });
  const representante = await Representante.findOne({ _id: contrato.idRepresentante });
  const estudiante = await Estudiante.findOne({ _id: doc.idEstudiante });

  let arrayDeParentesco = [];
  doc.pregunta73.forEach(element => {
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
                { text: 'Como le encontramos en Facebook?: ' },
                `${doc.pregunta2}`,
              ]
            },
          ]
        },
        '\n',
        {
          columns: [

            {
              text: [
                { text: 'Nombre de la institución donde estudia: ' },
                `${representante.pregunta2}`,
              ]
            },
            {
              text: [
                { text: 'Año / Curso: ' },
                `${representante.pregunta3}`,
              ]
            },
          ]
        },
        '\n',
        {
          columns: [
            {
              text: [
                { text: 'Promedio Matemáticas: ' },
                `${doc.pregunta6}`,
              ]
            },
            {
              text: [
                { text: 'Promedio Lenguaje: ' },
                `${representante.pregunta4}`,
              ]
            },

          ]
        },
        '\n',
        {
          columns: [

            {
              text: [
                { text: 'Promedio C. Sociales: ' },
                `${representante.pregunta5}`,
              ]
            },
            {
              text: [
                { text: 'Promedio C. Naturales: ' },
                `${doc.pregunta1}`,
              ]
            },
          ]
        },
        '\n',
        {
          columns: [

            {
              text: [
                { text: 'Promedio Idioma Extranjero: ' },
                `${representante.pregunta7}`,
              ]
            },
            {
              text: [
                { text: 'Otros,¿Cual?: ' },
                `${representante.pregunta9}`,
              ]
            },
          ]
        },
        '\n\n',
        {
          text: 'DATOS DEL REPRESENTANTE',

        },
        '\n\n',
        {
          columns: [
            {
              text: [
                { text: 'Nombres: ' },
                `${representante.nombresApellidos}`,
              ]
            },
            {
              text: [
                { text: 'Correo electrónico: ' },
                `${representante.email}`,
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
          text: 'Explique el motivo principal por el cual decidió tomar el entrenamiento ILVEM para su representado:',

        },
        '\n',
        {
          text: `${doc.pregunta11}`,
        },
        '\n\n',
        {
          text: 'Mencione los acuerdos establecidos con su Consultor Educativo:',

        },
        '\n',
        {
          text: `${doc.pregunta12}`,
        },
        '\n\n',
        '\n\n',
        {
          text: '1.- HISTORIA Y DESARROLLO',

        },
        '\n\n',
        {
          text: 'EMBARAZO Y PARTO',
          alignment: 'center',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA', 'OBSERVACIONES'],
              ['Planificado', `${doc.pregunta13.respuesta}`, `${doc.pregunta13.observacion}`],
              ['¿Necesitó reposo durante el embarazo?', `${doc.pregunta14.respuesta}`, `${doc.pregunta14.observacion}`],
              ['Complicaciones durante el embarazo', `${doc.pregunta15.respuesta}`, `${doc.pregunta15.observacion}`],
              ['Número de Embarazo', `${doc.pregunta16}`, ''],
              ['Edad de la madre durante el embarazo', `${doc.pregunta17}`, ''],
              ['Tiempo de gestación', `${doc.pregunta18}`, ''],
              ['Tipo de parto', `${doc.pregunta19}`, ''],
              ['Algún dato importante durante el nacimiento del niño/a', `${doc.pregunta20}`, ''],
              ['¿Necesitó ayuda (fórceps) durante el parto? ', `${doc.pregunta21}`, ''],
              ['El niño/a requirió incubadora', `${doc.pregunta22}`, ''],
            ]
          }
        },
        '\n\n',
        {
          text: 'ANTECEDENTES POST-NATALES',

          alignment: 'center',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA', 'OBSERVACIONES'],
              ['Lactancia Materna', `${doc.pregunta24.respuesta}`, `${doc.pregunta24.observacion}`],
              ['Succión de dedos', `${doc.pregunta25.respuesta}`, `${doc.pregunta25.observacion}`],
              ['Enfermedades ', `${doc.pregunta26.respuesta}`, `${doc.pregunta26.observacion}`],
              ['Separaciones largas de la madre', `${doc.pregunta27.respuesta}`, `${doc.pregunta27.observacion}`],
              ['¿Gateó? ', `${doc.pregunta28.respuesta}`, `${doc.pregunta28.observacion}`],
              ['¿Caminó? ', `${doc.pregunta29.respuesta}`, `${doc.pregunta29.observacion}`],
              ['Primeras palabras ', `${doc.pregunta30.respuesta}`, `${doc.pregunta30.observacion}`],
              ['Control de esfínteres', `${doc.pregunta31.respuesta}`, `${doc.pregunta31.observacion}`],
            ]
          }
        },
        '\n\n',
        {
          text: 'ANTECEDENTES POST-NATALES',

          alignment: 'center',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['Se distrae fácilmente, no es capaz de mantenerse en una tarea', `${doc.pregunta32}`],
              ['Necesita releer las tareas de la escuela muchas veces para comprenderlas', `${doc.pregunta33}`],
              ['Se le dificulta planificar, prefiere unirse a los planes de los demás', `${doc.pregunta34}`],
              ['Dificultad para iniciar o completar proyectos o tareas sin ayudaa', `${doc.pregunta35}`],
              ['Pobre memoria de corto plazo', `${doc.pregunta36}`],
              ['Presenta dificultad para copiar las tareas en clase', `${doc.pregunta37}`],
              ['Recuerda el orden secuencial de las tareas', `${doc.pregunta38}`],
              ['Invierte u omite letras al leer o escribir', `${doc.pregunta39}`],

            ]
          }
        },
        '\n\n',
        {
          text: 'ÁREA PSICOMOTRÍZ',

          alignment: 'center',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['Se cansa facilmente', `${doc.pregunta40}`],
              ['Confunde izquierda con derecha', `${doc.pregunta41}`],
              ['Dificultad para agarrar el lápiz', `${doc.pregunta42}`],
              ['Reconoce las partes de su cuerpo', `${doc.pregunta43}`],
              ['Tiende a atropellarse con las personas u objetos y pierde el equilibrio al caminar', `${doc.pregunta44}`],
              ['Presenta mala caligrafía', `${doc.pregunta45}`],
              ['Dificultad para subir y bajar escaleras', `${doc.pregunta46}`],

            ]
          }
        },
        '\n\n',
        {
          text: 'SOCIAL EMOCIONAL',

          alignment: 'center',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['Tiene dificultad para hacer y mantener amigos', `${doc.pregunta47}`],
              ['Tiene facilidad para demostrar sus emociones hacia los demás', `${doc.pregunta48}`],
              ['Dificultad para controlar sus reacciones emocionales', `${doc.pregunta49}`],
              ['Tiende a aislarse de otros niños', `${doc.pregunta50}`],
              ['Presenta síntomas de intranquilidad', `${doc.pregunta51}`],
              ['Su hijo es intolerante frente a las dificultades que se le presentan', `${doc.pregunta52}`],
              ['Tiene facilidad para demostrar sus emociones hacia los demás', `${doc.pregunta53}`],

            ]
          }
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
              ['¿Consume su niño/a algún tipo de medicamento actualmente?', `${doc.pregunta55.respuesta}`, `${doc.pregunta55.observacion}`],
              ['¿Presenta algún tipo de condición médica?', `${doc.pregunta56.respuesta}`, `${doc.pregunta56.observacion}`],
              ['Convulsione', `${doc.pregunta57}`, ``],
              ['Epilepsia', `${doc.pregunta58}`, ``],
              ['Ansiedad', `${doc.pregunta59}`, ``],
              ['Depresión', `${doc.pregunta60}`, ``],
              ['Sueño irregular', `${doc.pregunta61}`, ``],
              ['Se come las uñas', `${doc.pregunta62}`, ``],
              ['Moja la cama', `${doc.pregunta63}`, ``],
              ['Tics nerviosos', `${doc.pregunta64}`, ``],
              ['Cirugías', `${doc.pregunta65.respuesta}`, `${doc.pregunta65.observacion}`],
              ['Ha recibido alguna terapia?', `${doc.pregunta66.respuesta}`, `${doc.pregunta66.observacion}`],
              ['Actualmente recibe alguna terapia', `${doc.pregunta67.respuesta}`, `${doc.pregunta67.observacion}`],
            ]
          }
        },
        '\n\n',
        {
          text: '3.- HISTORIA ESCOLAR',

        },
        '\n\n',
        {
          text: 'En general ¿cómo describiría la experiencia de su niño/a en la escuela desde su inicio hasta el momento actual?',

        },
        '\n',
        {
          text: `${doc.pregunta68}`,

        },
        '\n\n',
        {
          text: '¿Tiene llamados de atención constantes por parte de los/as docentes de la escuela con relación a su hijo/a (conducta, desempeño, etc.)?',

        },
        '\n',
        {
          text: `${doc.pregunta69}`,

        },
        '\n\n',
        {
          text: '4.- CONDUCTA',

        },
        '\n\n',
        {
          text: 'Cómo describiría la conducta de su hijo/a',

        },
        '\n',
        {
          text: `${doc.pregunta70}`,

        },
        '\n\n',
        {
          text: '¿Cuáles son, en general las fortalezas y debilidades de su hijo/a?',

        },
        '\n',
        {

          table: {
            body: [
              ['Áreas fuertes', `${doc.pregunta71}`],
              ['Áreas fuertes', `${doc.pregunta72}`],

            ]
          }
        },
        '\n\n',
        {
          text: '5.- ADAPTACIÓN FAMILIAR',

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
          text: 'Mencione con quién vive el niño o niña',

        },
        '\n',
        {
          text: `${doc.pregunta74}`,

        },
        '\n\n',
        {
          text: 'Mencione con quién vive el niño o niña',

        },
        '\n',
        {
          text: `${doc.pregunta74}`,

        },
        '\n\n',
        {
          text: '¿Cómo es su relación con cada miembro de la familia?',

        },
        '\n',
        {
          text: `${doc.pregunta75}`,

        },
        '\n\n',
        {
          text: 'Cómo es su relación con cada miembro de la familia PADRE',

        },
        '\n',
        {
          text: `${doc.pregunta76}`,

        },
        '\n\n',
        {
          text: 'Cómo es su relación con cada miembro de la familia HERMANO',

        },
        '\n',
        {
          text: `${doc.pregunta77}`,

        },
        '\n\n',
        {
          text: 'Cómo es su relación con cada miembro de la familia OTROS',

        },
        '\n',
        {
          text: `${doc.pregunta78}`,

        },
        '\n\n',
        {
          text: '¿Se ha presentado algún evento relevante en la familia durante el desarrollo del niño o niña?',

        },
        '\n',
        {
          text: `${doc.pregunta79}`,

        },
      ]

    }
    const pdfDoc = printer.createPdfKitDocument(pdfDefinition);
    pdfDoc.pipe(fs.createWriteStream(`PEEA-IL-17-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`));
    pdfDoc.end();
  }, 2500);

  setTimeout(async () => {
    const esperar = await envioEmail.transporter.sendMail({
      from: USER_EMAIL,
      to: ['davidtamayoromo@gmail.com', representante.email],
      subject: `PEEA ILVEM 17|  ${contrato.codigo} | ${estudiante.nombresApellidos}`,
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
          filename: `PEEA-IL-17-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`,
          path: path.join(__dirname, `../../../../PEEA-IL-17-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`),
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

