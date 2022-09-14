

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
      enviarPdfTM17(doc);
    }, 1000);
    console.log(doc);
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


enviarPdfTM17 = async (doc) => {

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
            `${doc.pregunta4}`,
          ]
        },
        '\n',
        {
          text: [
            { text: 'Si tiene algún diagnóstico indique cual ' },
            `${doc.pregunta5}`,
          ]
        },
        '\n\n',
        {
          text: '1.- ESTRUCTURA FAMILIAR',

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
          text: [
            { text: 'Estado civil de los padres' },
            `${doc.pregunta7}`,
          ]
        },
        '\n',
        {
          text: '2. ANTECEDENTES PRE-NATALES',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA', 'OBSERVACIONES'],
              ['Planificado', `${doc.pregunta8}`, ''],
              ['Consumo de alcohol, drogas o medicamentos', `${doc.pregunta9}`, ''],
              ['Necesitó reposo durante el embarazo', `${doc.pregunta10}`, ''],
              ['Estrés Durante el Embarazo', `${doc.pregunta11}`, ''],
              ['Estrés Durante el Embarazo', `${doc.pregunta12}`, ''],
              ['Tipo de parto', `${doc.pregunta13}`, ''],
              ['El niño/a requirió incubadora?', `${doc.pregunta14}`, ''],
              ['¿Número de Embarazo?', `${doc.pregunta15}`, ''],
              ['Edad de la madre durante el embarazo', `${doc.pregunta16}`, ''],
              ['Tiempo de gestación', `${doc.pregunta17}`, ''],
              ['¿Algún dato importante durante el nacimiento del niño/a?', `${doc.pregunta18}`, ''],

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
              ['Lactancia Materna', `${doc.pregunta19}`, ''],
              ['Succión de dedos', `${doc.pregunta20}`, ''],
              ['Separaciones largas de la madre', `${doc.pregunta21}`, ''],
              ['Enfermedades', `${doc.pregunta22}`, ''],
              ['Control cefálico', `${doc.pregunta23}`, ''],
              ['Gateó', `${doc.pregunta24}`, ''],
              ['Caminó', `${doc.pregunta25}`, ''],
              ['Control de esfínteres', `${doc.pregunta27}`, ''],
              ['Actividad del niño/a', `${doc.pregunta28}`, ''],
            ]
          }
        },
        '\n\n',
        {
          text: '4. DESARROLLO DEL LENGUAJE',

          alignment: 'center',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['Balbuceo', `${doc.pregunta29}`],
              ['Primeras palabras', `${doc.pregunta30}`],
              ['Primeras Frases', `${doc.pregunta31}`],
              ['Primeras Frases', `${doc.pregunta31}`],

            ]
          }
        },
        '\n\n',
        {
          text: '5. SALUD:',

          alignment: 'center',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA', 'OBSERVACIONES'],
              ['En este momento, ¿Su niño/a goza de buena salud?', `${doc.pregunta33.respuesta}`, `${doc.pregunta33.observacion}`],
              ['¿Consume su niño/a algún tipo de medicamentos actualmente?', `${doc.pregunta34.respuesta}`, `${doc.pregunta34.observacion}`],
              ['¿Alguna enfermedad y/o condición específica? ¿Cuál?', `${doc.pregunta35}`, ``],
              ['Indique si ha sufrido o sufre alguno de estos padecimientos de  manera frecuente', `${doc.pregunta36}`, ``],

            ]
          }
        },
        '\n\n',
        {
          text: '6. DESARROLLO ACTUAL:',

          alignment: 'center',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['Reconoce las sensaciones del cuerpo, como: hambre, frío, calor, necesidad de usar el baño', `${doc.pregunta37}`],
              ['Tiene dificultad para sentarse recto', `${doc.pregunta38}`],
              ['Dificultad para practicar deportes', `${doc.pregunta39}`],
              ['Evita actividades que requieren equilibrio (montar bicicleta)', `${doc.pregunta40}`],
              ['Tiende a chocar con las personas u objetos', `${doc.pregunta41}`],
              ['Tiene mala caligrafía', `${doc.pregunta42}`],
              ['Confunde izquierda con derecha', `${doc.pregunta43}`],
              ['Tiene lateralidad manual definida', `${doc.pregunta45}`],
              ['Está en constante movimiento', `${doc.pregunta46}`],
              [' Busca contacto físico intenso', `${doc.pregunta47}`],
              ['Tiene poco equilibrio, se cae con facilidad', `${doc.pregunta48}`],
              ['Se cansa fácilmente, evita actividades físicas', `${doc.pregunta49}`],
              ['Dificultad para agarrar y manejar el lápiz', `${doc.pregunta50}`],
              ['Dificultad para vestirse y desvestirse', `${doc.pregunta51}`],
              ['Tiene conductas repetitivas', `${doc.pregunta52}`],
            ]
          }
        },
        '\n\n',
        {
          text: '7. GUSTO / OLFATO / VISTA:',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['Diferencia sabores como (dulce, salado, ácido, agrio, entre otros)', `${doc.pregunta53}`],
              ['Explora su ambiente a través del gusto', `${doc.pregunta54}`],
              ['Rechaza comida por la textura', `${doc.pregunta55}`],
              ['Mastica adecuadamente', `${doc.pregunta56}`],
              ['Siente náuseas con algún sabor', `${doc.pregunta57}`],
              ['Explora objetos con el olfato', `${doc.pregunta58}`],
              ['Tiene dificultad para discriminar colores y formas', `${doc.pregunta59}`],
              ['Tiene dificultad para mantener contacto visual', `${doc.pregunta60}`],
              ['Se lleva alimentos a la boca adecuadamente', `${doc.pregunta61}`],
            ]
          }
        },
        '\n\n',
        {
          text: '8. AUDICIÓN / LENGUAJE:',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['Pronuncia palabras de manera incorrecta', `${doc.pregunta62}`],
              ['Necesita que le repitan las instrucciones', `${doc.pregunta63}`],
              ['Tendencia a desviarse del tema', `${doc.pregunta64}`],
              ['Voz monótona, dificultades para entonar', `${doc.pregunta65}`],
              ['Reconoce o repite ritmos o canciones', `${doc.pregunta66}`],
              ['Ladea la cabeza cuando intenta oír', `${doc.pregunta67}`],
              ['Dificultad para comprender lo que lee', `${doc.pregunta68}`],
              ['Falta de fluidez y articulación verbal', `${doc.pregunta69}`],
              ['Dificultades de ortografía y caligrafía', `${doc.pregunta70}`],
              ['Presenta tartamudez', `${doc.pregunta71}`],
              ['¿Cómo se integra con los adultos?', `${doc.pregunta73}`],
              ['Áreas fuertes', `${doc.pregunta74}`],
              ['Áreas débiles', `${doc.pregunta75}`],
            ]
          }
        },
        '\n\n',
        {
          text: '9. SOCIAL EMOCIONAL:',

        },
        '\n\n',
        {
          style: 'tableExample',
          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['Se muestra flexible a los cambios', `${doc.pregunta76}`],
              ['Tiene dificultad para hacer y mantener amigos', `${doc.pregunta77}`],
              ['Cambia de una actividad a otra con facilidad', `${doc.pregunta78}`],
              ['Llanto fácil, sin motivo aparente', `${doc.pregunta79}`],
              ['Tiene dificultad para manejar sus relaciones emocionales', `${doc.pregunta80}`],
              ['Se desconecta o pierde interés durante actividades grupales', `${doc.pregunta81}`],
              ['Tiende a aislarse', `${doc.pregunta82}`],
              ['Se enoja con facilidad', `${doc.pregunta83}`],
              ['Es afectivo, le gusta tocar y abrazar', `${doc.pregunta84}`],
            ]
          }
        },
        '\n\n',
        {
          text: '10. ORGANIZACIÓN / ATENCIÓN / CONOCIMIENTO:',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['Se distrae fácilmente', `${doc.pregunta85}`],
              ['Tiene deficiente memoria de corto plazo', `${doc.pregunta86}`],
              ['Necesita leer las tareas escolares muchas veces para comprenderlas', `${doc.pregunta87}`],
              ['Planificar se le dificulta, prefiere unirse a los planes de los demás', `${doc.pregunta88}`],
              ['Desorganizado con las asignaturas de la escuela, sus pertenencias, horarios', `${doc.pregunta89}`],
              ['Recuerda el orden secuencial de las tareas', `${doc.pregunta90}`],
              ['Tiene dificultad para iniciar o completar tareas sin ayuda', `${doc.pregunta91}`],
              ['Le cuesta concentrarse en una sola cosa a la vez', `${doc.pregunta92}`],
              ['Invierte u omite letras al leer o escribir', `${doc.pregunta93}`],
              ['Tiene dificultad para copiar las tareas escolares', `${doc.pregunta94}`],
              ['Se prepara para los exámenes académicos', `${doc.pregunta95}`],
              ['¿De qué manera le resulta más fácil aprender?', `${doc.pregunta96}`],
              ['¿Cuándo quiere aprender algo de memoria?', `${doc.pregunta97}`],
            ]
          }
        },
        '\n\n',
        {
          text: '11. AMBIENTE ESCOLAR:',

        },
        '\n\n',
        {

          table: {
            body: [
              ['PREGUNTA', 'RESPUESTA'],
              ['¿En general cómo describiría la experiencia en la institución educativa? ¿Ha existido alguna queja?', `${doc.pregunta98}`],
              ['¿Cómo describiría la conducta y el carácter de su hijo/a?', `${doc.pregunta99}`],
              ['Observaciones generales', `${doc.pregunta100}`],
            ]
          }
        },

      ]

    }
    const pdfDoc = printer.createPdfKitDocument(pdfDefinition);
    pdfDoc.pipe(fs.createWriteStream(`PEEA-TM-17-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`));
    pdfDoc.end();
  }, 2500);

  setTimeout(async () => {
    const esperar = await envioEmail.transporter.sendMail({
      from: USER_EMAIL,
      to: ['davidtamayoromo@gmail.com', representante.email],
      subject: `PEEA TOMATIS 17|  ${contrato.codigo} | ${estudiante.nombresApellidos}`,
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
          filename: `PEEA-TM-17-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`,
          path: path.join(__dirname, `../../../../PEEA-TM-17-${contrato.codigo}-${estudiante.nombresApellidos}.pdf`),
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
