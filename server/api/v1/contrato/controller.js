const mongoose = require("mongoose");
const { USER_EMAIL } = process.env;

const fonts = {
  Roboto: {
    normal: new Buffer(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64')
  }
}
const PdfPrinter = require('pdfmake');
const printer = new PdfPrinter(fonts);

/* const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs; */

/* const pdfMakePrinter = require('pdfmake/src/printer'); */
const pdfmake = require('pdfmake');

const Model = require('./model');
const Role = require('../role/model');
const Persona = require('../persona/model');
const Representante = require('../representante/model');
const Estudiante = require('../estudiante/model');
const Programa = require('../programa/model');
const Ciudad = require('../ciudad/model');
const Marca = require('../marca/model');

const { paginar } = require('../../../utils');
const { singToken } = require('./../auth');


const { fields } = require('./model');

const envioEmail = require('../../../email');

const path = require('path');

const { v4 } = require('uuid');
const fs = require('fs');
const model = require("../marca/model");
const dbPath = path.join(__dirname, '../../../uploads/contratos/');


/**
 * Obtener ID de un Contrato
 */
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

/**
 * Crear Contrato
 */
exports.create = async (req, res, next) => {
  /**
   * Saber quien creo el contrato
   */
  const { body = {}, params = {}, decoded = {} } = req;
  const { _id = null } = decoded;

  if (_id) {
    body.addedUser = _id;
    //Encontrar con la ciudad de la persona que crea el contrato
    const persona = await Persona.findOne({ "_id": _id }).exec();
    const ciudad = await Ciudad.findOne({ "_id": persona.idCiudad[0] }).exec();
    //Generar Numero de contrato (Dependiendo de la ciudad generar codigo de contrato)
    const totalContratos = await Model.countDocuments();
    const codigoContrato = `${ciudad.nombre.charAt(0).toUpperCase()}-${totalContratos + 9000}`;
    Object.assign(body, { codigo: codigoContrato });
  }


  //TODO:Agregar ciudad del contrato (agregar el atributo idCiudad)

  Object.assign(body, params);
  Object.assign(body, { fechaAprobacion: '1990-01-01' });

  console.log(body);

  const document = new Model(body);




  try {

    const doc = await document.save();
    res.status(201);
    res.json({
      success: true,
      data: doc
    });
    setTimeout(() => {
      //TODO: DESCOMENTAR SOLO POR MIGRACION DESACTIVADO
      //construirPDFcontrato(doc._id);
    }, 1000);
  } catch (err) {
    next(new Error(err));
  }
};


// Enviar correo con la construccion de pdf
async function construirPDFcontrato(idContrato) {
  const contrato = await Model.findById(idContrato).exec();
  const representante = await Representante.findById(contrato.idRepresentante).exec();
  const estudiante = await Estudiante.find({ 'idRepresentante': contrato.idRepresentante }).exec();

  crearPDF(contrato, representante, estudiante);
}

let segundaCH = '';
let terceraCH = '';
let quintaCH = '';
let sextaCH = '';
let septimaCH = '';
let octavaCH = '';
let novenaCH = '';
let decinaCH = '';
let decimorprimeraCH = '';
let decimosegundaCH = '';

let segundaIL = '';
let terceraIL = '';
let quintaIL = '';
let sextaIL = '';
let septimaIL = '';
let octavaIL = '';
let novenaIL = '';
let decinaIL = '';
let decimorprimeraIL = '';
let decimosegundaIL = '';


let segundaTM = '';
let terceraTM = '';
let quintaTM = '';
let sextaTM = '';
let septimaTM = '';
let octavaTM = '';
let novenaTM = '';
let decinaTM = '';
let decimorprimeraTM = '';
let decimosegundaTM = '';
let decimoterceraTM = '';
let decimocuartaTM = '';

let segundaUK = '';
let terceraUK = '';
let quintaUK = '';
let sextaUK = '';
let septimaUK = '';
let octavaUK = '';
let novenaUK = '';
let decinaUK = '';
let decimorprimeraUK = '';
let decimosegundaUK = '';

let cuartaCH = ['', '', '', '', '', '', '', '', '', '', '', '', ''];
let cuartaIL = ['', '', '', '', '', '', '', '', '', '', '', '', ''];
let cuartaTM = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
let cuartaUK = ['', '', '', '', '', '', '', '', '', '', '', '', ''];

async function crearPDF(contrato, representante, estudiantes) {

  //console.log('marcas vendidas' + contrato.marcasVendidas);

  contrato.marcasVendidas.forEach(marca => {
    if (marca.nombre == 'CHARLOTTE') {
      //CHARLOTTE
      segundaCH = 'SEGUNDA: ILVEM & CHARLOTTE CIA. LTDA. es un prestador de servicios de un tercer idioma como es el ingl??s que puede ser de forma presencial y online. Cuenta con un entrenamiento de pr??cticas; a trav??s de la Plataforma CHARLOTTE, en la cual el estudiante de CHARLOTTE tiene un acceso ilimitado durante el entrenamiento.';
      terceraCH = 'TERCERA: AUTORIZACI??N, COMPROMISO Y RESPONSABILIDAD FRENTE A LA INSTITUCI??N.- \n El CLIENTE Y/O USUARIO autoriza expresamente lo siguiente: a) Autorizo a ILVEM & CHARLOTTE CIA. LTDA ;  a la captaci??n de im??genes del o los estudiantes usuarios de este contrato, su reproducci??n y difusi??n, ya sea a trav??s de medios f??sicos (flyers, revistas, prensa escrita, gigantograf??as, volantes) y/o medios digitales (p??gina web, redes sociales como Facebook, Youtube e Instagram entre otros) exclusivamente para fines relacionados a la promoci??n y difusi??n publicitaria.';
      quintaCH = 'QUINTA: OBLIGACIONES\n1.	EL USUARIO Y/O CLIENTE  SE OBLIGA A :\n???	Garantizar la asistencia a las plataformas y clases de manera virtual o presencial en los horarios establecidos ya que el beneficiario debe tener el 85% de asistencia m??nima para lograr sus  objetivos acad??micos.\n???	Realizar los pagos de manera puntual correspondientes por los m??dulos y/o capacitaci??n establecida.\n???	Cancelar los valores correspondientes para la emisi??n de los certificados. \n???	Iniciar y finalizar de manera adecuada el entrenamiento adquirido ya sea ??sta virtual y/o presencial\n???	Realizar el pago parcial y/o total de los haberes por incumplimiento o retraso de las cuotas\n???	Mantener la efectividad del entrenamiento de CHARLOTTE a trav??s de la pr??ctica del uso de la plataforma y los medios tecnol??gicos presentados\n2.	ILVEM Y CHARLOTTE CIA. LTDA  SE OBLIGA A:\n???	 Brindar al estudiante asesor??as acad??micas altamente especializadas durante el proceso del entrenamiento\n???	Entregar al o  los BENEFICIARIOS; una vez culminado el entrenamiento, los documentos que acrediten su respectivo nivel de conocimientos, previo lo mencionado en el presente contrato.\n???	Crear la clave de la plataforma educativa para su respectivo seguimiento, control y garant??a de avances. Para ellos es necesario el uso de un correo electr??nico personal (ESTE DEBER?? ESTAR SUSCRITO BAJO ESTE CONTRATO EN LETRA IMPRENTA Y MAY??SCULAS)';
      sextaCH = 'SEXTA: PLAZOS\n???	 El usuario y/o cliente deber?? ser contactado por Direcci??n Acad??mica para la separaci??n de horarios hasta 72 horas a partir de la firma del presente contrato.\n???	 El presente contrato no ser?? renovado autom??ticamente.';
      septimaCH = 'S??PTIMA: VIGENCIA\n???	La capacitaci??n ya sea virtual y/o presencial tendr?? una duraci??n de 9 meses (mas 3 meses de garant??a) a partir de la firma del contrato de servicios acad??micos el mismo que no ser?? renovable autom??ticamente.';
      octavaCH = 'OCTAVA: PRIVACIDAD Y TRATAMIENTO DE INFORMACI??N.-\nILVEM &  CHARLOTTE CIA. LTDA. Garantizar?? la privacidad y confidencialidad de la informaci??n del titular del presente contrato y solo la utilizar?? para brindar el servicio contratado, por lo que el titular conoce y  SI       NO       autoriza que ILVEM & CHARLOTTE CIA. LTDA. pueda proporcionar a terceros datos necesarios para poder realizar la entrega de estados de cuenta, recordatorios de fechas de pago, fidelizaci??n, informaci??n de nuevos servicios, informaci??n de promociones especiales, entre otros; as?? mismo tambi??n autoriza a hacer uso de esta informaci??n para fines comerciales o de brindar beneficios al titular del presente contrato a trav??s de alianzas desarrolladas. Adicionalmente el titular acepta expresamente que ILVEM & CHARLOTTE CIA. LTDA. Puede utilizar medios electr??nicos y llamadas para notificar cambios: a) Notificar cambios relacionados con los t??rminos y condiciones del presente contrato. b) Realizar gestiones de cobranzas y de m??s promociones aplicables de acuerdo a la normativa vigente. Sin embargo de lo anterior ILVEM & CHARLOTTE CIA. LTDA. podr?? entregar los datos del titular en caso de requerimientos realizados por la autoridad competente conforme al ordenamiento jur??dico vigente.';
      novenaCH = 'NOVENA: DECLARACI??N FUNDAMENTAL.- El titular declara que ha obtenido por parte de ILVEM & CHARLOTTE CIA. LTDA. Toda la informaci??n veraz y completa del servicio contratado. As?? mismo declara que conoce ??ntegramente el presente contrato en su anverso y reverso y que los acepta en todas sus partes por convenir a sus intereses y es conocedor que los valores entregados por anticipos, pagos totales sean estos efectivos, transferencias, cheques, tarjetas de cr??dito y/o canjes no son reembolsables bajo ning??n concepto; y, por lo tanto, oblig??ndose libremente al cumplimiento de los mismos. Adicionalmente las partes declaran que ??ste contrato es Ley para ambas partes y tiene los efectos determinados del C??digo Civil, es decir es IRREVOCABLE UNILATERALMENTE, raz??n por la cual es conocedor que no hay devoluciones.';
      decinaCH = 'D??CIMA: ACUERDO TOTAL.- El presente contrato contiene los acuerdos totales de las partes y deja sin efecto cualquier negociaci??n, entendimiento, contrato o convenio que haya existido; el presente instrumento incluye todas las condiciones a las que se compromete la empresa y el alcance ??nico de sus servicios y deja sin efecto cualquier informaci??n adicional recibida que no conste en el mismo. El titular al suscribir el presente contrato reconoce la licitud de sus fondos y exime de responsabilidad a ILVEM & CHARLOTTE CIA. LTDA. Respecto a los valores derogados a su favor, de acuerdo al objeto del presente contrato.';
      decimorprimeraCH = 'D??CIMO PRIMERA: JURISDICCI??N, COMPETENCIA Y CONTROVERSIA. - Toda controversia o diferencia relativa a este contrato, a su ejecuci??n, liquidaci??n e interpretaci??n, ser?? sometida obligatoriamente en primera instancia a mediaci??n en el Centro de Arbitraje y Mediaci??n de la C??mara de Comercio, con sede en la ciudad de Quito. En el evento que el conflicto no fuere resuelto mediante este procedimiento, las partes se someter??n a la resoluci??n de un Tribunal de Arbitraje de la C??mara de Comercio, que se sujetar?? a lo dispuesto en la Ley de Arbitraje y Mediaci??n, el Reglamento del CAM de la C??mara de Comercio, y las siguientes normativas y preceptos: El Tribunal estar?? integrado por TRES ??rbitros, designados por el CAM de la C??mara de Comercio, de conformidad a lo establecido en la Ley de Arbitraje y Mediaci??n. El Tribunal decidir?? en derecho.';
      decimosegundaCH = 'D??CIMO  SEGUNDA: NOTIFICACIONES.- Toda y cualquier notificaci??n que requiera realizarse en relaci??n con el presente contrato ser?? por escrito a las siguientes direcciones de correo electr??nico:      dpto.legal@grupojetmind.com   -  cio@grupojetmind.com \n\nLas partes aceptan todas y cada una de las estipulaciones que anteceden e incorporan a este contrato las disposiciones legales que fueren aplicables, firmando para constancia en dos ejemplares de igual tenor y valor.';

    }
    if (marca.nombre == 'ILVEM') {
      //ILVEM
      segundaIL = 'SEGUNDA: ILVEM & CHARLOTTE CIA. LTDA. es un prestador de servicios de Entrenamiento en T??cnicas y M??todos de Estudio de forma presencial y online. Cuenta con un entrenamiento de pr??cticas; a trav??s de la Plataforma VIRTUAL, en la cual el estudiante de ILVEM tiene un acceso ilimitado durante el entrenamiento.';
      terceraIL = 'TERCERA: AUTORIZACI??N, COMPROMISO Y RESPONSABILIDAD FRENTE A LA INSTITUCI??N. -\nEl CLIENTE Y/O USUARIO autoriza expresamente lo siguiente: a) Autorizo a ILVEM & CHARLOTTE CIA. LTDA; a la captaci??n de im??genes del o los estudiantes usuarios de este contrato, su reproducci??n y difusi??n, ya sea a trav??s de medios f??sicos (flyers, revistas, prensa escrita, gigantograf??as, volantes) y/o medios digitales (p??gina web, redes sociales como Facebook, Youtube e Instagram entre otros) exclusivamente para fines relacionados a la promoci??n y difusi??n publicitaria.';
      quintaIL = 'QUINTA: OBLIGACIONES\n1.	EL USUARIO Y/O CLIENTE SE OBLIGA A:\n???	Garantizar la asistencia a las plataformas y clases de manera virtual o presencial en los horarios establecidos ya que el beneficiario debe tener el 85% de asistencia m??nima para lograr sus objetivos acad??micos.\n???	Realizar los pagos de manera puntual correspondientes por los m??dulos y/o capacitaci??n establecida.\n???	Cancelar los valores correspondientes para la emisi??n de los certificados. \n???	Iniciar y finalizar de manera adecuada el entrenamiento adquirido ya sea ??sta virtual y/o presencial\n???	Realizar el pago parcial y/o total de los haberes por incumplimiento o retraso de las cuotas\n???	Mantener la efectividad del entrenamiento de ILVEM a trav??s de la pr??ctica del uso de la plataforma y los medios tecnol??gicos presentados\n2.	ILVEM Y CHARLOTTE CIA. LTDA SE OBLIGA A:\n???	 Brindar al estudiante asesor??as acad??micas altamente especializadas durante el proceso del entrenamiento\n???	Entregar al o los BENEFICIARIOS; una vez culminado el entrenamiento, los documentos que acrediten su respectivo nivel de conocimientos, previo lo mencionado en el presente contrato.\n???	Crear la clave de la plataforma educativa para su respectivo seguimiento, control y garant??a de avances. Para ellos es necesario el uso de un correo electr??nico personal (ESTE DEBER?? ESTAR SUSCRITO BAJO ESTE CONTRATO EN LETRA IMPRENTA Y MAY??SCULAS)';
      sextaIL = 'SEXTA: PLAZOS\n???	 El usuario y/o cliente deber?? ser contactado por Direcci??n Acad??mica para la separaci??n de horarios hasta 72 horas a partir de la firma del presente contrato.\n???	 El presente contrato no ser?? renovado autom??ticamente.';
      septimaIL = 'S??PTIMA: VIGENCIA\n???	La capacitaci??n ya sea virtual y/o presencial tendr?? una duraci??n de 9 meses (m??s 3 meses de garant??a) a partir de la firma del contrato de servicios acad??micos el mismo que no ser?? renovable autom??ticamente.';
      octavaIL = 'OCTAVA: PRIVACIDAD Y TRATAMIENTO DE INFORMACI??N. -\nILVEM & CHARLOTTE CIA. LTDA. Garantizar?? la privacidad y confidencialidad de la informaci??n del titular del presente contrato y solo la utilizar?? para brindar el servicio contratado, por lo que el titular conoce y SI         NO        autoriza que ILVEM & CHARLOTTE CIA. LTDA. pueda proporcionar a terceros datos necesarios para poder realizar la entrega de estados de cuenta, recordatorios de fechas de pago, fidelizaci??n, informaci??n de nuevos servicios, informaci??n de promociones especiales, entre otros; as?? mismo tambi??n autoriza a hacer uso de esta informaci??n para fines comerciales o de brindar beneficios al titular del presente contrato a trav??s de alianzas desarrolladas. Adicionalmente el titular acepta expresamente que ILVEM & CHARLOTTE CIA. LTDA. Puede utilizar medios electr??nicos y llamadas para notificar cambios: a) Notificar cambios relacionados con los t??rminos y condiciones del presente contrato. b) Realizar gestiones de cobranzas y de m??s promociones aplicables de acuerdo a la normativa vigente. Sin embargo, de lo anterior ILVEM & CHARLOTTE CIA. LTDA. podr?? entregar los datos del titular en caso de requerimientos realizados por la autoridad competente conforme al ordenamiento jur??dico vigente.';
      novenaIL = 'NOVENA: DECLARACI??N FUNDAMENTAL. - El titular declara que ha obtenido por parte de ILVEM & CHARLOTTE CIA. LTDA. Toda la informaci??n veraz y completa del servicio contratado. As?? mismo declara que conoce ??ntegramente el presente contrato en su anverso y reverso y que los acepta en todas sus partes por convenir a sus intereses y es conocedor que los valores entregados por anticipos, pagos totales sean estos efectivos, transferencias, cheques, tarjetas de cr??dito y/o canjes no son reembolsables bajo ning??n concepto; y, por lo tanto, oblig??ndose libremente al cumplimiento de los mismos. Adicionalmente las partes declaran que ??ste contrato es Ley para ambas partes y tiene los efectos determinados del C??digo Civil, es decir es IRREVOCABLE UNILATERALMENTE, raz??n por la cual es conocedor que no hay devoluciones.';
      decinaIL = 'D??CIMA: ACUERDO TOTAL. - El presente contrato contiene los acuerdos totales de las partes y deja sin efecto cualquier negociaci??n, entendimiento, contrato o convenio que haya existido; el presente instrumento incluye todas las condiciones a las que se compromete la empresa y el alcance ??nico de sus servicios y deja sin efecto cualquier informaci??n adicional recibida que no conste en el mismo. El titular al suscribir el presente contrato reconoce la licitud de sus fondos y exime de responsabilidad a ILVEM & CHARLOTTE CIA. LTDA. Respecto a los valores derogados a su favor, de acuerdo al objeto del presente contrato.';
      decimorprimeraIL = 'D??CIMO PRIMERA: JURISDICCI??N, COMPETENCIA Y CONTROVERSIA. - Toda controversia o diferencia relativa a este contrato, a su ejecuci??n, liquidaci??n e interpretaci??n, ser?? sometida obligatoriamente en primera instancia a mediaci??n en el Centro de Arbitraje y Mediaci??n de la C??mara de Comercio, con sede en la ciudad de Quito. En el evento que el conflicto no fuere resuelto mediante este procedimiento, las partes se someter??n a la resoluci??n de un Tribunal de Arbitraje de la C??mara de Comercio, que se sujetar?? a lo dispuesto en la Ley de Arbitraje y Mediaci??n, el Reglamento del CAM de la C??mara de Comercio, y las siguientes normativas y preceptos: El Tribunal estar?? integrado por TRES ??rbitros, designados por el CAM de la C??mara de Comercio, de conformidad a lo establecido en la Ley de Arbitraje y Mediaci??n. El Tribunal decidir?? en derecho.';
      decimosegundaIL = 'Las partes aceptan todas y cada una de las estipulaciones que anteceden e incorporan a este contrato las disposiciones legales que fueren aplicables, firmando para constancia en dos ejemplares de igual tenor y valor.';
    }

    if (marca.nombre == 'TOMATIS') {
      //TOMATIS
      segundaTM = 'SEGUNDA: ECUTOMATIS. CIA. LTDA. Es un prestador de servicios de Estimulaci??n auditiva  neurosensorial de forma presencial (Escucha) y online (Integraci??n). Cuenta con un entrenamiento de pr??cticas; a trav??s de las clases on-line, en la cual el estudiante tiene un entrenamiento personalizado.';
      terceraTM = 'TERCERA: AUTORIZACI??N, COMPROMISO Y RESPONSABILIDAD FRENTE A LA INSTITUCI??N.- El BENEFICIARIO Y/O REPRESENTANTE autoriza expresamente lo siguiente: a) Autorizo ECUTOMATIS CIA. LTDA. A la captaci??n de im??genes del o los estudiantes beneficiarios de este contrato, su reproducci??n y difusi??n, ya sea mediante medios f??sicos (flyers, revistas, prensa escrita, gigantograf??as, volantes) y/o digital (p??gina web, redes sociales como Facebook, Youtube, Instagram y Tik Tok) exclusivamente para fines relacionados a la promoci??n y difusi??n publicitaria. En caso de requerir informaci??n acerca de su representado le sugerimos dejarnos su correo electr??nico para un mejor proceso. (ESCRIBIR CON LETRAS MAY??SCULAS E IMPRENTA EL E-MAIL).';
      quintaTM = 'QUINTA: DERECHOS ECUTOMATIS CIA. LTDA \nUna vez aceptado el convenio. ECUTOMATIS CIA. LTDA puede exigir legalmente y de manera inmediata el pago de los valores correspondientes a la inscripci??n y/o cuotas educativas. Reestructurar o actualizar de manera total o parcial los programas y plataformas de estudio.';
      sextaTM = 'SEXTA: OBLIGACIONES \n1.	EL BENEFICIARIO SE OBLIGA A :\n???	El Padre de Familia o Representante Legal se compromete a realizar junto al beneficiario el proceso de escucha (12 ?? 13 d??as), de manera regular (lunes a viernes) en un horario fijo una vez que este coordinado con el profesional. \n???	Se compromete a brindar al beneficiario el material necesario para potencializar sus capacidades, alcanzar metas reales acorde al aprendizaje previo.\n???	Manipular los equipos con las manos limpias y secas. Evitar colocar los equipos en superficies inestables o cerca de l??quidos. \n???	Una vez iniciado el programa de estimulaci??n neuroauditivo, el cliente debe culminar el mismo.';
      septimaTM = 'S??PTIMA: ECUTOMATIS CIA. LTDA SE OBLIGA A: \n???	Brindar al estudiante asesor??as altamente especializadas durante el proceso de estimulaci??n.\n???	Entregar a los BENEFICIARIOS; una vez culminado el programa, los documentos que acrediten su respectivo nivel trabajado, previo lo mencionado en el presente contrato.';
      octavaTM = 'OCTAVA: PLAZOS\n???	El representante y/o beneficiario deber?? comunicarse a separar horarios hasta los 3 meses a partir de la firma del presente contrato, pasado este tiempo (3 meses) este documento quedar?? anulado sin derecho a devoluci??n.\n???	Una vez hecha la entrevista con el director acad??mico las clases se inician de acuerdo al calendario y horario establecido. \n???	El presente contrato no ser?? renovado autom??ticamente.';
      novenaTM = 'NOVENA: VIGENCIA\nLa capacitaci??n presencial tendr?? una duraci??n de 8 meses (3 fases) inclu??do 13 d??as (lunes a viernes) de sesiones de escucha. \n';
      decinaTM = 'D??CIMA: PRIVACIDAD Y TRATAMIENTO DE INFORMACI??N.- ECUTOMATIS CIA. LTDA. \nGarantizar?? la privacidad y confidencialidad de la informaci??n del titular del presente contrato y solo la utilizar?? para brindar el servicio contratado, por lo que el titular conoce y SI NO autoriza que ECUTOMATIS CIA. LTDA. pueda proporcionar a terceros datos necesarios para poder realizar la entrega de estados de cuenta, recordatorios de fechas de pago, fidelizaci??n, informaci??n de nuevos servicios, informaci??n de promociones especiales, entre otros; as?? mismo tambi??n autoriza a hacer uso de esta informaci??n para fines comerciales o de brindar beneficios al titular del presente contrato a trav??s de alianzas desarrolladas.\nAdicionalmente el titular acepta expresamente que ECUTOMATIS CIA. LTDA. Puede utilizar medios electr??nicos y llamadas para notificar cambios: \na)	Notificar cambios relacionados con los t??rminos y condiciones del presente contrato.\nb)	Realizar gestiones de cobranzas y de m??s promociones aplicables de acuerdo a la normativa vigente. Sin embargo de lo anterior ECUTOMATIS CIA. LTDA. Podr?? entregar los datos del titular en caso de requerimientos realizados por la autoridad competente conforme al ordenamiento jur??dico vigente. ';
      decimorprimeraTM = 'D??CIMA PRIMERA: DECLARACI??N FUNDAMENTAL.- El titular declara que ha obtenido por parte de ECUTOMATIS CIA. LTDA. Toda la informaci??n veraz y completa del servicio contratado. As?? mismo declara que conoce ??ntegramente el presente contrato en su anverso y reverso y que los acepta en todas sus partes por convenir a sus intereses y es conocedor que los valores entregados por anticipos, pagos totales sean estos efectivo, transferencias, cheques, tarjetas de cr??dito y/o canjes no son reembolsables bajo ning??n concepto; y, por lo tanto oblig??ndose libremente al cumplimiento de los mismos. Adicionalmente las partes declaran que ??ste contrato es Ley para ambas partes y tiene los efectos determinados del C??digo Civ??l, es decir es IRREVOCABLE UNILATERALMENTE, raz??n por la cual es conocedor que no hay devoluciones.';
      decimosegundaTM = 'D??CIMA SEGUNDA: ACUERDO TOTAL.- (ACEPTACI??N CONTRATO ELECTR??NICO) El presente contrato on line contiene los acuerdos totales de las partes y deja sin efecto cualquier negociaci??n, entendimiento, contrato o convenio que haya existido; el presente instrumento incluye todas las condiciones a las que se compromete la empresa y el alcance ??nico de sus servicios y deja sin efecto cualquier informaci??n adicional recibida que no conste en el mismo. El titular al suscribir el presente contrato reconoce la licitud de sus fondos y exime de responsabilidad a ECUTOMATIS CIA. LTDA. Respecto a los valores erogados a su favor, de acuerdo al objeto del presente contrato . ';
      decimoterceraTM = 'D??CIMO TERCERA: JURISDICCI??N, COMPETENCIA Y CONTROVERSIA.- Toda controversia o diferencia relativa a este contrato, a su ejecuci??n, liquidaci??n e interpretaci??n, ser?? sometida obligatoriamente en primera instancia a mediaci??n en el Centro de Arbitraje y Mediaci??n de la C??mara de Comercio, con sede en la ciudad de Quito. En el evento que el conflicto no fuere resuelto mediante este procedimiento, las partes la someter??n a la resoluci??n de un Tribunal de Arbitraje de la C??mara de Comercio, que se sujetar?? a lo dispuesto en la Ley de Arbitraje y Mediaci??n, el Reglamento del CAM de la C??mara de Comercio, y las siguientes normativas y preceptos: El Tribunal estar?? integrado por TRES ??rbitros, designados por el CAM de la C??mara de Comercio, de conformidad a lo establecido en la Ley de Arbitraje y Mediaci??n. El Tribunal decidir?? en derecho. ';
      decimocuartaTM = 'D??CIMO CUARTA: NOTIFICACIONES.- Toda y cualquier notificaci??n que requiera realizarse en relaci??n con el presente contrato ser?? por escrito a las siguientes direcciones de correo electr??nico: dpto.legal@grupojetmind.com - cio@grupojetmind.com Las partes aceptan todas y cada una de las estipulaciones que anteceden e incorporan a este contrato las disposiciones legales que fueran aplicables, firmando para constancia en dos ejemplares de igual tenor y valor.\nLas partes aceptan todas y cada una de las estipulaciones que anteceden e incorporan a este contrato las disposiciones legales que fueren aplicables, firmando para constancia en dos ejemplares de igual tenor y valor.';

    }
    if (marca.nombre == 'UK ENGLISH INSTITUTE') {
      //UK ENGLISH INSTITUTE
      segundaUK = 'SEGUNDA: JETMINDCIA. LTDA. es un prestador de servicios de un tercer idioma como es el ingl??s que es ??nicamente de forma online. Cuenta con un entrenamiento de pr??cticas; a trav??s de la Plataforma UK INSTITUTE, en la cual el estudiante de UK INSTITUTE tiene un acceso ilimitado durante el entrenamiento.';
      terceraUK = 'TERCERA: AUTORIZACI??N, COMPROMISO Y RESPONSABILIDAD FRENTE A LA INSTITUCI??N. -\nEl CLIENTE Y/O USUARIO autoriza expresamente lo siguiente: a) Autorizo a JETMIND CIA. LTDA ;  a la captaci??n de im??genes del o los estudiantes usuarios de este contrato, su reproducci??n y difusi??n, ya sea a trav??s de medios f??sicos (flyers, revistas, prensa escrita, gigantograf??as, volantes) y/o medios digitales (p??gina web, redes sociales como Facebook, Youtube e Instagram entre otros) exclusivamente para fines relacionados a la promoci??n y difusi??n publicitaria.';
      quintaUK = 'QUINTA: OBLIGACIONES\n1.	EL USUARIO Y/O CLIENTE  SE OBLIGA A :\n???	Garantizar la asistencia a las plataformas y clases de manera virtual o presencial en los horarios establecidos ya que el beneficiario debe tener el 85% de asistencia m??nima para lograr sus objetivos acad??micos.\n???	Realizar los pagos de manera puntual correspondientes por los m??dulos y/o capacitaci??n establecida.\n???	Cancelar los valores correspondientes para la emisi??n de los certificados. \n???	Iniciar y finalizar de manera adecuada el entrenamiento adquirido ya sea ??sta virtual y/o presencial\n???	Realizar el pago parcial y/o total de los haberes por incumplimiento o retraso de las cuotas\n???	Mantener la efectividad del entrenamiento de UK INSTITUTE a trav??s de la pr??ctica del uso de la plataforma y los medios tecnol??gicos presentados\n2.	JETMIND CIA. LTDA  SE OBLIGA A:\n???	 Brindar al estudiante asesor??as acad??micas altamente especializadas durante el proceso del entrenamiento\n???	Entregar al o los BENEFICIARIOS; una vez culminado el entrenamiento, los documentos que acrediten su respectivo nivel de conocimientos, previo lo mencionado en el presente contrato.\n???	Crear la clave de la plataforma educativa para su respectivo seguimiento, control y garant??a de avances. Para ellos es necesario el uso de un correo electr??nico personal (ESTE DEBER?? ESTAR SUSCRITO BAJO ESTE CONTRATO EN LETRA IMPRENTA Y MAY??SCULAS)';
      sextaUK = 'SEXTA: PLAZOS\n???	 El usuario y/o cliente deber?? ser contactado por Direcci??n Acad??mica para la separaci??n de horarios hasta 72 horas a partir de la firma del presente contrato.\n???	 El presente contrato no ser?? renovado autom??ticamente.';
      septimaUK = 'S??PTIMA: VIGENCIA\n???	La capacitaci??n ya sea virtual y/o presencial tendr?? una duraci??n de 9 meses (mas 3 meses de garant??a) a partir de la firma del contrato de servicios acad??micos el mismo que no ser?? renovable autom??ticamente.';
      octavaUK = 'OCTAVA: PRIVACIDAD Y TRATAMIENTO DE INFORMACI??N. -\nJETMIND CIA. LTDA. Garantizar?? la privacidad y confidencialidad de la informaci??n del titular del presente contrato y solo la utilizar?? para brindar el servicio contratado, por lo que el titular conoce y SI       NO       autoriza que JETMIND CIA. LTDA. pueda proporcionar a terceros datos necesarios para poder realizar la entrega de estados de cuenta, recordatorios de fechas de pago, fidelizaci??n, informaci??n de nuevos servicios, informaci??n de promociones especiales, entre otros; as?? mismo tambi??n autoriza a hacer uso de esta informaci??n para fines comerciales o de brindar beneficios al titular del presente contrato a trav??s de alianzas desarrolladas. Adicionalmente el titular acepta expresamente que JETMIND CIA. LTDA. Puede utilizar medios electr??nicos y llamadas para notificar cambios: a) Notificar cambios relacionados con los t??rminos y condiciones del presente contrato. b) Realizar gestiones de cobranzas y de m??s promociones aplicables de acuerdo a la normativa vigente. Sin embargo, de lo anterior JETMIND CIA. LTDA. podr?? entregar los datos del titular en caso de requerimientos realizados por la autoridad competente conforme al ordenamiento jur??dico vigente.';
      novenaUK = 'NOVENA: DECLARACI??N FUNDAMENTAL. - El titular declara que ha obtenido por parte de JETMIND CIA. LTDA. Toda la informaci??n veraz y completa del servicio contratado. As?? mismo declara que conoce ??ntegramente el presente contrato en su anverso y reverso y que los acepta en todas sus partes por convenir a sus intereses y es conocedor que los valores entregados por anticipos, pagos totales sean estos efectivos, transferencias, cheques, tarjetas de cr??dito y/o canjes no son reembolsables bajo ning??n concepto; y, por lo tanto, oblig??ndose libremente al cumplimiento de los mismos. Adicionalmente las partes declaran que ??ste contrato es Ley para ambas partes y tiene los efectos determinados del C??digo Civil, es decir es IRREVOCABLE UNILATERALMENTE, raz??n por la cual es conocedor que no hay devoluciones.';
      decinaUK = 'D??CIMA: ACUERDO TOTAL. - El presente contrato contiene los acuerdos totales de las partes y deja sin efecto cualquier negociaci??n, entendimiento, contrato o convenio que haya existido; el presente instrumento incluye todas las condiciones a las que se compromete la empresa y el alcance ??nico de sus servicios y deja sin efecto cualquier informaci??n adicional recibida que no conste en el mismo. El titular al suscribir el presente contrato reconoce la licitud de sus fondos y exime de responsabilidad a JETMINDCIA. LTDA. Respecto a los valores derogados a su favor, de acuerdo al objeto del presente contrato.';
      decimorprimeraUK = 'D??CIMO PRIMERA: JURISDICCI??N, COMPETENCIA Y CONTROVERSIA. - Toda controversia o diferencia relativa a este contrato, a su ejecuci??n, liquidaci??n e interpretaci??n, ser?? sometida obligatoriamente en primera instancia a mediaci??n en el Centro de Arbitraje y Mediaci??n de la C??mara de Comercio, con sede en la ciudad de Quito. En el evento que el conflicto no fuere resuelto mediante este procedimiento, las partes se someter??n a la resoluci??n de un Tribunal de Arbitraje de la C??mara de Comercio, que se sujetar?? a lo dispuesto en la Ley de Arbitraje y Mediaci??n, el Reglamento del CAM de la C??mara de Comercio, y las siguientes normativas y preceptos: El Tribunal estar?? integrado por TRES ??rbitros, designados por el CAM de la C??mara de Comercio, de conformidad a lo establecido en la Ley de Arbitraje y Mediaci??n. El Tribunal decidir?? en derecho.';
      decimosegundaUK = 'D??CIMO  SEGUNDA: NOTIFICACIONES.- Toda y cualquier notificaci??n que requiera realizarse en relaci??n con el presente contrato ser?? por escrito a las siguientes direcciones de correo electr??nico:      dpto.legal@grupojetmind.com   -  cio@grupojetmind.com\n Las partes aceptan todas y cada una de las estipulaciones que anteceden e incorporan a este contrato las disposiciones legales que fueren aplicables, firmando para constancia en dos ejemplares de igual tenor y valor.';

    }
  });

  let arrayEstudiantes = [];

  estudiantes.forEach((estudiante) => {
    let nombrePorgrama = [];
    let nombreMarca = [];
    Programa.find({ idEstudiante: { $in: [mongoose.Types.ObjectId(estudiante._id)] } })
      .populate('idMarca')
      .populate('idCiudad')
      .populate('idSucursal')
      .populate('idNombrePrograma')
      .populate('idEstudiante')
      .populate('addedUser', 'nombresApellidos tipo email estado')
      .populate('modifiedUser', 'nombresApellidos tipo email estado')
      .exec((err, programa) => {

        programa[0].idNombrePrograma.forEach((progra) => {
          nombrePorgrama.push(progra.nombre);
          Marca.findById(progra.idMarca).exec((err, marca) => {
            nombreMarca.push(marca.nombre);
            console.log('nombre marca' + nombreMarca);
            if (marca.nombre == 'CHARLOTTE') {
              //CHARLOTTE
              cuartaCH[0] = '\n\n\n\n CLAUSULAS CHARLOTTE\n\n\n\n';
              cuartaCH[1] = segundaCH + '\n\n';
              cuartaCH[2] = terceraCH + '\n\n';
              cuartaCH[3] = 'CUARTA: DERECHOS PROGRAMA CHARLOTTE\n???	El estudiante tendr?? derecho al uso de su plataforma durante el periodo de su entrenamiento\n???	La plataforma educativa tendr?? un tiempo de duraci??n de acuerdo al servicio adquirido; siendo contabilizado a partir del momento de su activaci??n.\n???	Soporte del Centro Virtual: El usuario tendr?? derecho a recibir la gula del uso de la plataforma\n???	Soporte t??cnico acompa??ado de su usuario y contrase??a';
              cuartaCH[4] = '\n\n' + progra.observaciones + '\n\n';
              cuartaCH[5] = quintaCH + '\n\n';
              cuartaCH[6] = sextaCH + '\n\n';
              cuartaCH[7] = septimaCH + '\n\n';
              cuartaCH[8] = octavaCH + '\n\n';
              cuartaCH[9] = novenaCH + '\n\n';
              cuartaCH[10] = decinaCH + '\n\n';
              cuartaCH[11] = decimorprimeraCH + '\n\n';
              cuartaCH[12] = decimosegundaCH + '\n\n';
            }
            if (marca.nombre == 'ILVEM') {
              //ILVEM
              cuartaIL[0] = '\n\n\n\n CLAUSULAS ILVEM\n\n\n\n';
              cuartaIL[1] = segundaIL + '\n\n';
              cuartaIL[2] = terceraIL + '\n\n';
              cuartaIL[3] = 'CUARTA: DERECHOS PROGRAMA ILVEM \n???	El estudiante tendr?? derecho al uso de su plataforma durante el periodo de su entrenamiento; siendo contabilizado a partir del momento de su activaci??n.\n???	Recibir asesor??a especializada mediante clases virtuales o presenciales de acuerdo el servicio y modalidad adquirida durante el periodo del entrenamiento.\n???	Soporte del Centro Virtual.\n???	El usuario tendr?? derecho a recibir los m??dulos: Lectura de alto rendimiento, Memoria, M??todos y H??bitos de Estudio y Oratoria, seg??n lo adquirido en su contrato.\n???	Todos los estudiantes tendr??n acceso a los siguientes servicios complementarios:\n';
              cuartaIL[4] = '\n\n' + progra.observaciones + '\n\n';
              cuartaIL[5] = quintaIL + '\n\n';
              cuartaIL[6] = sextaIL + '\n\n';
              cuartaIL[7] = septimaIL + '\n\n';
              cuartaIL[8] = octavaIL + '\n\n';
              cuartaIL[9] = novenaIL + '\n\n';
              cuartaIL[10] = decinaIL + '\n\n';
              cuartaIL[11] = decimorprimeraIL + '\n\n';
              cuartaIL[12] = decimosegundaIL + '\n\n';
            }
            if (marca.nombre == 'TOMATIS') {
              //TOMATIS

              cuartaTM[0] = '\n\n\n\n CLAUSULAS TOMATIS\n\n\n\n';
              cuartaTM[1] = segundaTM + '\n\n';
              cuartaTM[2] = terceraTM + '\n\n';
              cuartaTM[3] = 'CUARTA: DERECHOS \n';
              cuartaTM[4] = progra.observaciones + '\n\n';
              cuartaTM[5] = quintaTM + '\n\n';
              cuartaTM[6] = sextaTM + '\n\n';
              cuartaTM[7] = septimaTM + '\n\n';
              cuartaTM[8] = octavaTM + '\n\n';
              cuartaTM[9] = novenaTM + '\n\n';
              cuartaTM[10] = decinaTM + '\n\n';
              cuartaTM[11] = decimorprimeraTM + '\n\n';
              cuartaTM[12] = decimosegundaTM + '\n\n';
              cuartaTM[13] = decimoterceraTM + '\n\n';
              cuartaTM[14] = decimocuartaTM + '\n\n';
            }
            if (marca.nombre == 'UK ENGLISH INSTITUTE') {
              //UK ENGLISH INSTITUTE

              cuartaUK[0] = '\n\n\n\n CLAUSULAS UK ENGLISH INSTITUTE\n\n\n\n';
              cuartaUK[1] = segundaUK + '\n\n';
              cuartaUK[2] = terceraUK + '\n\n';
              cuartaUK[3] = 'CUARTA: DERECHOS PROGRAMA UK INSTITUTE \nEl estudiante tendr?? derecho al uso de su plataforma durante el periodo de su entrenamiento\n???	La plataforma educativa tendr?? un tiempo de duraci??n de acuerdo al servicio adquirido; siendo contabilizado a partir del momento de su activaci??n.\n???	Soporte del Centro Virtual: El usuario tendr?? derecho a recibir la gula del uso de la plataforma\n???	Soporte t??cnico acompa??ado de su usuario y contrase??a\n\n';
              cuartaUK[4] = progra.observaciones + '\n\n';
              cuartaUK[5] = quintaUK + '\n\n';
              cuartaUK[6] = sextaUK + '\n\n';
              cuartaUK[7] = septimaUK + '\n\n';
              cuartaUK[8] = octavaUK + '\n\n';
              cuartaUK[9] = novenaUK + '\n\n';
              cuartaUK[10] = decinaUK + '\n\n';
              cuartaUK[11] = decimorprimeraUK + '\n\n';
              cuartaUK[12] = decimosegundaUK + '\n\n';
              console.log('UK ' + cuartaUK);
            }

          });

        });
      });

    setTimeout(() => {
      arrayEstudiantes.push([estudiante.nombresApellidos, estudiante.cedula, calcularEdad(estudiante.fechaNacimiento), `${nombreMarca}`, `${nombrePorgrama}`]);

      //controlar que exista solo una clausula de la marca charlotte
      const tablaCH = {};
      const unicosCH = cuartaCH.filter((indice) => {
        return tablaCH.hasOwnProperty(indice) ? false : (tablaCH[indice] = true);
      });
      cuartaCH = unicosCH;

      const tablaIL = {};
      const unicosIL = cuartaIL.filter((indice) => {
        return tablaIL.hasOwnProperty(indice) ? false : (tablaIL[indice] = true);
      });
      cuartaIL = unicosIL;

      const tablaTM = {};
      const unicosTM = cuartaTM.filter((indice) => {
        return tablaTM.hasOwnProperty(indice) ? false : (tablaTM[indice] = true);
      });
      cuartaTM = unicosTM;

      const tablaUK = {};
      const unicosUK = cuartaUK.filter((indice) => {
        return tablaUK.hasOwnProperty(indice) ? false : (tablaUK[indice] = true);
      });
      cuartaUK = unicosUK;


    }, 800);

  });


  let matricula = 0;
  if (contrato.valorMatricula == undefined) {
    matricula = 0;
  } else {
    matricula = contrato.valorMatricula;
  }

  let cuotas = 0;
  let valorMensual = 0;
  if (contrato.valorMatricula == undefined) {
    cuotas = 0;

  } else {
    cuotas = contrato.numeroCuotas;
    valorMensual = ((contrato.valorTotal * this.configuracionPorcentaje) - matricula) / cuotas;
  }


  setTimeout(() => {
    const pdfDefinition = {
      content: [
        {
          columns: [
            {
              text: 'Contrato Digital'
            },
            {
              image: path.join(__dirname, '../../../uploads/marcas/f195494a-22dd-4d02-bfae-faf07e35d3f6.png'),
              width: 200,
              alignment: 'center',
            },
            {
              text: 'C??DIGO: ' + contrato.codigo,
              //bold: true,
              //fontSize: 12
            }
          ]
        },
        '\n\n',
        {
          text: `En la ciudad de Quito, Distrito Metropolitano, en la fecha ${contrato.fecha}, comparecen a la celebraci??n del presente Contrato de Prestaci??n de Servicios por una parte la Compa????a ILVEM Y CHARLOTTE, la misma que est?? legalmente constituida en la Rep??blica del Ecuador`
        },
        '\n\n',
        {
          text: `DATOS TITULAR DEL CONTRATO`
        },
        '\n\n',
        {
          // style: 'tableExample',
          table: {
            body: [
              ['Nombre', representante.nombresApellidos],
              ['Cedula', representante.cedula],
              ['Telefono', representante.telefono],
              ['Telefono Domicilio', representante.telefonoDomicilio],
              ['Direccion', representante.direccion],
              ['Email', representante.email],
            ]
          }
        },
        '\n\n',
        {
          text: `DATOS ESTUDIANTES DEL CONTRATO`
        },
        '\n\n',
        {
          //style: 'tableExample',
          table: {
            body: [
              ['Estudiante', 'Cedula', 'Edad', 'Marca', 'Programas Adquiridos'],
              ...arrayEstudiantes
            ]
          }
        },
        '\n\n',
        {
          text: `OBSERVACIONES DEL CONTRATO`
        },
        '\n\n',
        {
          text: contrato.comentario,
        },
        '\n\n',
        {
          text: 'Asesor comercial: ' + contrato.addedUser.nombresApellidos,
        },
        '\n\n',
        {
          text: `Toda promoci??n aplica restricciones, para que una beca se mantenga vigente, es requisito obligatorio que el(los) estudiantes principal(es) se encuentren en estado activo, es decir; que est??n recibiendo normalmente el entrenamiento`
        },

        '\n\n',
        {
          text: `DATOS ECONOMICOS DEL CONTRATO`
        },
        '\n\n',
        {
          //style: 'tableExample',
          table: {
            body: [
              ['Forma de pago', contrato.formaPago],
              ['Valor Total', '$ ' + contrato.valorTotal],
              ['Valor Matricula', '$ ' + matricula],
              ['Numero de cuotas', cuotas],
              ['Valor Mensual', '$ ' + valorMensual]
            ]
          }
        },

        '\n\n',
        {
          image: path.join(__dirname, '../../../uploads/marcas/fd7edbb9-936f-4289-9969-b821047cde61.png'),
          width: 150,
          alignment: 'center',
        },
        '\n',
        {
          text: cuartaIL
        },
        '\n\n',
        {
          image: path.join(__dirname, '../../../uploads/marcas/d89863d0-f162-4615-b005-c58bdd82648f.png'),
          width: 150,
          alignment: 'center',
        },
        '\n',
        {
          text: cuartaCH
        },
        '\n\n',
        {
          image: path.join(__dirname, '../../../uploads/marcas/3f77e037-c883-4e7f-9a27-ea8f59521128.png'),
          width: 150,
          alignment: 'center',
        },
        '\n',
        {
          text: cuartaTM
        },
        '\n\n',
        {
          image: path.join(__dirname, '../../../uploads/marcas/5d39ec2a-cc54-47ce-880d-97a071be9a20.png'),
          width: 150,
          alignment: 'center',
        },
        '\n',
        {
          text: cuartaUK
        },

      ]
    }



    const pdfDoc = printer.createPdfKitDocument(pdfDefinition);
    pdfDoc.pipe(fs.createWriteStream(`contratoDigital${contrato.codigo}.pdf`));
    pdfDoc.end();
    //TODO: Eliminar archivo cuando pase 1 hora



  }, 2500);


  setTimeout(async () => {
    console.log('entre envio correo correo');
    //Enviar correo electronico al representante
    const esperar = await envioEmail.transporter.sendMail({
      from: USER_EMAIL,
      to: ['davidtamayoromo@gmail.com', representante.email],
      subject: `CONTRATO DIGITAL  |  ${contrato.codigo}`,
      html: `<div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:16px\"><span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">Estimado/a; ${representante.nombresApellidos}, reciba nuestra m??s cordial bienvenida a nuestro centro de entrenamiento. </span></span><br></div><div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:16px\"><span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">Adjunto a este correo, va a poder visualizar su contrato digital.<br></span></span></div><div><br></div><div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:13.3333px\"><span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">Nota: Este es un correo autom??tico, por favor no responder. Si tiene alguna duda o pregunta, comunicarse con su asesor comercial para que ??ste le ayude con su solicitud.</span></span><br></div>`,
      attachments: [
        {
          filename: `contratoDigital${contrato.codigo}.pdf`,
          path: path.join(__dirname, `../../../../contratoDigital${contrato.codigo}.pdf`),
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

async function calcularEdad(fecha) {
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
  let registro = [];
  const vector = persona.idMarca.forEach(x => {
    registro.push(x.toString());
  });

  try {
    let docs;
    let totalContratos;
    if (role.nombre.includes('Super')) {
      console.log('entre Super');
      docs = await Model.find({})
        .populate('idRepresentante', 'nombresApellidos cedula email estado telefono')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .populate('personaAprueba', 'nombresApellidos tipo email estado')
        .sort({ '_id': -1 })//ayuda a ordenar del ultimo registro al primero
        .skip(skip).limit(limit).exec();

      totalContratos = await Model.countDocuments();

    } else if (role.nombre.includes('Admin')) {
      console.log('entre admin');
      docs = await Model.aggregate([
        {
          $unwind: '$marcasVendidas'
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'addedUser',
            foreignField: '_id',
            as: 'addedUser'
          }
        },
        {
          $match: {
            $and:
              [
                { 'addedUser.idCiudad': { $in: persona.idCiudad } },
                /* { "marcasVendidas.item_id": { $in: registro } } */
              ]
          }
        },
        {
          $group: {
            _id: '$_id',
            voucher: { $first: '$voucher' },
            estado: { $first: '$estado' },
            idRepresentante: { $first: '$idRepresentante' },
            tipoPago: { $first: '$tipoPago' },
            estadoVenta: { $first: '$estadoVenta' },
            valorTotal: { $first: '$valorTotal' },
            formaPago: { $first: '$formaPago' },
            comentario: { $first: '$comentario' },
            directorAsignado: { $first: '$directorAsignado' },
            estadoPrograma: { $first: '$estadoPrograma' },
            fechaAprobacion: { $first: '$fechaAprobacion' },
            campania: { $first: '$campania' },
            marcasVendidas: { $push: '$marcasVendidas' },
            addedUser: { $first: '$addedUser' },
            codigo: { $first: '$codigo' },
            abono: { $first: '$abono' },
            pea: { $first: '$pea' },
            entrevistaInicial: { $first: '$entrevistaInicial' },
            createdAt: { $first: '$createdAt' },
            updateAt: { $first: '$updateAt' },
            fecha: { $first: '$fecha' },
            numeroCuotas: { $first: '$numeroCuotas' },
            valorMatricula: { $first: '$valorMatricula' }
          }
        },
        {
          $lookup: {
            from: 'representantes',
            localField: 'idRepresentante',
            foreignField: '_id',
            as: 'idRepresentante'
          }
        },
        {
          $unwind: '$idRepresentante'
        },
        {
          $unwind: '$addedUser'
        }
      ])
        .sort({ '_id': -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      console.log(docs);
      totalContratos = await Model.countDocuments();
    }
    if (role.nombre.includes('User') || role.nombre.includes('Docente')) {
      console.log('entre User');
      docs = await Model.aggregate([
        {
          $unwind: '$marcasVendidas'
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'addedUser',
            foreignField: '_id',
            as: 'addedUser'
          }
        },
        {
          $match: {
            $and:
              [
                { 'addedUser.0._id': persona._id },
                { 'addedUser.idCiudad': { $in: persona.idCiudad } }
              ]
          }
        },
        {
          $group: {
            _id: '$_id',
            voucher: { $first: '$voucher' },
            estado: { $first: '$estado' },
            idRepresentante: { $first: '$idRepresentante' },
            tipoPago: { $first: '$tipoPago' },
            estadoVenta: { $first: '$estadoVenta' },
            valorTotal: { $first: '$valorTotal' },
            formaPago: { $first: '$formaPago' },
            comentario: { $first: '$comentario' },
            directorAsignado: { $first: '$directorAsignado' },
            estadoPrograma: { $first: '$estadoPrograma' },
            fechaAprobacion: { $first: '$fechaAprobacion' },
            campania: { $first: '$campania' },
            marcasVendidas: { $push: '$marcasVendidas' },
            addedUser: { $first: '$addedUser' },
            codigo: { $first: '$codigo' },
            abono: { $push: '$abono' },
            pea: { $first: '$pea' },
            entrevistaInicial: { $first: '$entrevistaInicial' },
            createdAt: { $first: '$createdAt' },
            updateAt: { $first: '$updateAt' },
            fecha: { $first: '$fecha' },
            numeroCuotas: { $first: '$numeroCuotas' },
            valorMatricula: { $first: '$valorMatricula' }
          }
        },
        {
          $lookup: {
            from: 'representantes',
            localField: 'idRepresentante',
            foreignField: '_id',
            as: 'idRepresentante'
          }
        },
        {
          $unwind: '$idRepresentante'
        },
        {
          $unwind: '$addedUser'
        }
      ])

        .sort({ '_id': -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      totalContratos = await Model.countDocuments();
    }

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalContratos
    });

  } catch (err) {
    next(new Error(err));
  }


  /* const { query = {}, decoded = {} } = req;
  const { _id = null } = decoded;//_id persona que esta ingresada en el sistema 

  console.log('_id', _id);

  const { limit, page, skip } = paginar(query);

  const persona = await Persona.findOne({ "_id": _id });

  //TODO:Si soy administrador veo todos los datos
  //TODO:Si soy marketing solo veo mis contratos



  try {
    const docs = await Model.find({})
      .populate('idRepresentante', 'nombresApellidos cedula email estado')
      .populate('addedUser', 'nombresApellidos tipo email estado')
      .populate('modifiedUser', 'nombresApellidos tipo email estado')
      .populate('personaAprueba', 'nombresApellidos tipo email estado')
      .sort({ '_id': -1 })//ayuda a ordenar del ultimo registro al primero
      .skip(skip).limit(limit).exec();

    const totalContratos = await Model.countDocuments();

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalContratos
    });
  } catch (err) {
    next(new Error(err));
  } */

};

exports.allAprobados = async (req, res, next) => {

  const { query = {}, decoded = {} } = req;
  const { _id = null } = decoded;
  const { limit, page, skip } = paginar(query);

  const persona = await Persona.findOne({ "_id": _id });
  const role = await Role.findOne({ "_id": { $in: persona.tipo } });
  let registro = [];
  const vector = persona.idMarca.forEach(x => {
    registro.push(x.toString());
  });

  try {
    let docs;
    let totalContratos;
    if (role.nombre.includes('Super')) {
      console.log('entre Super');
      docs = await Model.find({ estado: 'Aprobado' })
        .populate('idRepresentante', 'nombresApellidos cedula email estado telefono')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .populate('personaAprueba', 'nombresApellidos tipo email estado')
        .sort({ '_id': -1 })//ayuda a ordenar del ultimo registro al primero
        .skip(skip).limit(limit).exec();

      totalContratos = await Model.countDocuments();

    } else if (role.nombre.includes('Admin')) {
      console.log('entre admin');
      docs = await Model.aggregate([
        {
          $match: {
            estado: 'Aprobado'
          }
        },
        {
          $unwind: '$marcasVendidas'
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'addedUser',
            foreignField: '_id',
            as: 'addedUser'
          }
        },
        {
          $match: {
            $and:
              [
                { 'addedUser.idCiudad': { $in: persona.idCiudad } },
                { "marcasVendidas.item_id": { $in: registro } }
              ]
          }
        },
        {
          $group: {
            _id: '$_id',
            voucher: { $first: '$voucher' },
            estado: { $first: '$estado' },
            idRepresentante: { $first: '$idRepresentante' },
            tipoPago: { $first: '$tipoPago' },
            estadoVenta: { $first: '$estadoVenta' },
            valorTotal: { $first: '$valorTotal' },
            formaPago: { $first: '$formaPago' },
            comentario: { $first: '$comentario' },
            directorAsignado: { $first: '$directorAsignado' },
            estadoPrograma: { $first: '$estadoPrograma' },
            fechaAprobacion: { $first: '$fechaAprobacion' },
            campania: { $first: '$campania' },
            marcasVendidas: { $push: '$marcasVendidas' },
            addedUser: { $first: '$addedUser' },
            codigo: { $first: '$codigo' },
            abono: { $first: '$abono' },
            pea: { $first: '$pea' },
            entrevistaInicial: { $first: '$entrevistaInicial' },
            createdAt: { $first: '$createdAt' },
            updateAt: { $first: '$updateAt' },
            fecha: { $first: '$fecha' },
            agendaEntrevista: { $first: '$agendaEntrevista' }
          }
        },
        {
          $lookup: {
            from: 'representantes',
            localField: 'idRepresentante',
            foreignField: '_id',
            as: 'idRepresentante'
          }
        },
        {
          $unwind: '$idRepresentante'
        },
        {
          $unwind: '$addedUser'
        }
      ])
        .sort({ '_id': -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      totalContratos = await Model.countDocuments();
    }
    if (role.nombre.includes('User') || role.nombre.includes('Docente')) {
      console.log('entre User');
      docs = await Model.aggregate([
        {
          $match: {
            estado: 'Aprobado'
          }
        },
        {
          $unwind: '$marcasVendidas'
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'addedUser',
            foreignField: '_id',
            as: 'addedUser'
          }
        },
        {
          $match: {
            $and:
              [
                { 'addedUser.0._id': persona._id },
                { 'addedUser.idCiudad': { $in: persona.idCiudad } },
                { "marcasVendidas.item_id": { $in: registro } }
              ]
          }
        },
        {
          $group: {
            _id: '$_id',
            voucher: { $first: '$voucher' },
            estado: { $first: '$estado' },
            idRepresentante: { $first: '$idRepresentante' },
            tipoPago: { $first: '$tipoPago' },
            estadoVenta: { $first: '$estadoVenta' },
            valorTotal: { $first: '$valorTotal' },
            formaPago: { $first: '$formaPago' },
            comentario: { $first: '$comentario' },
            directorAsignado: { $first: '$directorAsignado' },
            estadoPrograma: { $first: '$estadoPrograma' },
            fechaAprobacion: { $first: '$fechaAprobacion' },
            campania: { $first: '$campania' },
            marcasVendidas: { $push: '$marcasVendidas' },
            addedUser: { $first: '$addedUser' },
            codigo: { $first: '$codigo' },
            abono: { $first: '$abono' },
            pea: { $first: '$pea' },
            entrevistaInicial: { $first: '$entrevistaInicial' },
            createdAt: { $first: '$createdAt' },
            updateAt: { $first: '$updateAt' },
            fecha: { $first: '$fecha' },
            agendaEntrevista: { $first: '$agendaEntrevista' },
          }
        },
        {
          $lookup: {
            from: 'representantes',
            localField: 'idRepresentante',
            foreignField: '_id',
            as: 'idRepresentante'
          }
        },
        {
          $unwind: '$idRepresentante'
        },
        {
          $unwind: '$addedUser'
        }
      ])

        .sort({ '_id': -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      totalContratos = await Model.countDocuments();
    }

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalContratos
    });

  } catch (err) {
    next(new Error(err));
  }

  /* const { query = {}, decoded = {} } = req;
  const { _id = null } = decoded;//_id persona que esta ingresada en el sistema 

  const { limit, page, skip } = paginar(query);

  const persona = await Persona.findOne({ "_id": _id });

  //TODO:Si soy administrador veo todos los datos
  //TODO:Si soy marketing solo veo mis contratos



  try {
    const docs = await Model.find({ estado: 'Aprobado' })
      .populate('idRepresentante', 'nombresApellidos cedula email estado')
      .populate('addedUser', 'nombresApellidos tipo email estado')
      .populate('modifiedUser', 'nombresApellidos tipo email estado')
      .populate('personaAprueba', 'nombresApellidos tipo email estado')
      .sort({ '_id': -1 })//ayuda a ordenar del ultimo registro al primero
      .skip(skip).limit(limit).exec();

    const totalContratos = await Model.countDocuments();

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalContratos
    });
  } catch (err) {
    next(new Error(err));
  } */

};

exports.allVistaDirectores = async (req, res, next) => {

  const { query = {}, decoded = {} } = req;
  const { _id = null } = decoded;
  const { limit, page, skip } = paginar(query);

  const persona = await Persona.findOne({ "_id": _id });
  const role = await Role.findOne({ "_id": { $in: persona.tipo } });
  let registro = [];
  const vector = persona.idMarca.forEach(x => {
    registro.push(x.toString());
  });

  try {
    let docs;
    let totalContratos;
    if (role.nombre.includes('Super')) {
      console.log('entre Super');
      docs = await Model.find()
        .populate('idRepresentante', 'nombresApellidos cedula email estado telefono')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .populate('personaAprueba', 'nombresApellidos tipo email estado')
        .sort({ '_id': -1 })//ayuda a ordenar del ultimo registro al primero
        .skip(skip).limit(limit).exec();

      totalContratos = await Model.countDocuments();

    } else if (role.nombre.includes('Admin')) {
      console.log('entre admin');
      docs = await Model.aggregate([

        {
          $unwind: '$marcasVendidas'
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'addedUser',
            foreignField: '_id',
            as: 'addedUser'
          }
        },
        {
          $match: {
            $and:
              [
                { 'addedUser.idCiudad': { $in: persona.idCiudad } },
                { "marcasVendidas.item_id": { $in: registro } }
              ]
          }
        },
        {
          $group: {
            _id: '$_id',
            voucher: { $first: '$voucher' },
            estado: { $first: '$estado' },
            idRepresentante: { $first: '$idRepresentante' },
            tipoPago: { $first: '$tipoPago' },
            estadoVenta: { $first: '$estadoVenta' },
            valorTotal: { $first: '$valorTotal' },
            formaPago: { $first: '$formaPago' },
            comentario: { $first: '$comentario' },
            directorAsignado: { $first: '$directorAsignado' },
            estadoPrograma: { $first: '$estadoPrograma' },
            fechaAprobacion: { $first: '$fechaAprobacion' },
            campania: { $first: '$campania' },
            marcasVendidas: { $push: '$marcasVendidas' },
            addedUser: { $first: '$addedUser' },
            codigo: { $first: '$codigo' },
            abono: { $first: '$abono' },
            pea: { $first: '$pea' },
            entrevistaInicial: { $first: '$entrevistaInicial' },
            createdAt: { $first: '$createdAt' },
            updateAt: { $first: '$updateAt' },
            fecha: { $first: '$fecha' },
            agendaEntrevista: { $first: '$agendaEntrevista' }
          }
        },
        {
          $lookup: {
            from: 'representantes',
            localField: 'idRepresentante',
            foreignField: '_id',
            as: 'idRepresentante'
          }
        },
        {
          $unwind: '$idRepresentante'
        },
        {
          $unwind: '$addedUser'
        }
      ])
        .sort({ '_id': -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      totalContratos = await Model.countDocuments();
    }
    if (role.nombre.includes('User') || role.nombre.includes('Docente')) {
      console.log('entre User');
      docs = await Model.aggregate([
        {
          $unwind: '$marcasVendidas'
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'addedUser',
            foreignField: '_id',
            as: 'addedUser'
          }
        },
        {
          $match: {
            $and:
              [
                { 'addedUser.0._id': persona._id },
                { 'addedUser.idCiudad': { $in: persona.idCiudad } },
                { "marcasVendidas.item_id": { $in: registro } }
              ]
          }
        },
        {
          $group: {
            _id: '$_id',
            voucher: { $first: '$voucher' },
            estado: { $first: '$estado' },
            idRepresentante: { $first: '$idRepresentante' },
            tipoPago: { $first: '$tipoPago' },
            estadoVenta: { $first: '$estadoVenta' },
            valorTotal: { $first: '$valorTotal' },
            formaPago: { $first: '$formaPago' },
            comentario: { $first: '$comentario' },
            directorAsignado: { $first: '$directorAsignado' },
            estadoPrograma: { $first: '$estadoPrograma' },
            fechaAprobacion: { $first: '$fechaAprobacion' },
            campania: { $first: '$campania' },
            marcasVendidas: { $push: '$marcasVendidas' },
            addedUser: { $first: '$addedUser' },
            codigo: { $first: '$codigo' },
            abono: { $first: '$abono' },
            pea: { $first: '$pea' },
            entrevistaInicial: { $first: '$entrevistaInicial' },
            createdAt: { $first: '$createdAt' },
            updateAt: { $first: '$updateAt' },
            fecha: { $first: '$fecha' },
            agendaEntrevista: { $first: '$agendaEntrevista' },
          }
        },
        {
          $lookup: {
            from: 'representantes',
            localField: 'idRepresentante',
            foreignField: '_id',
            as: 'idRepresentante'
          }
        },
        {
          $unwind: '$idRepresentante'
        },
        {
          $unwind: '$addedUser'
        }
      ])

        .sort({ '_id': -1 })
        .skip(skip)
        .limit(limit)
        .exec();
      totalContratos = await Model.countDocuments();
    }

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalContratos
    });

  } catch (err) {
    next(new Error(err));
  }

};


exports.allByAprobadosCiudadMarca = async (req, res, next) => {

  //TODO: Prueba para ver como ordenamos los datos
  const { query = {}, decoded = {} } = req;
  const { _id = null } = decoded;//_id persona que esta ingresada en el sistema 

  const { ciudad, marca } = req.params;

  const { limit, page, skip } = paginar(query);

  const persona = await Persona.findOne({ "_id": _id });


  /* let arrayCiudad = ciudad.split(',');
  let arrayCiudadObjectID = [];
  arrayCiudad.map(x => arrayCiudadObjectID.push(mongoose.Types.ObjectId(x)));

  let arrayMarca = marca.split(',');
  let arrayMarcaObjectID = [];
  arrayMarca.map(x => arrayMarcaObjectID.push(mongoose.Types.ObjectId(x))); */

  //TODO:Si soy administrador veo todos los datos
  //TODO:Si soy ventas solo veo mis contratos


  try {
    const docs = await model
      .aggregate([
        {
          $match: {
            estado: 'Aprobado'
          }
        },
        {
          $lookup: {
            from: 'representantes',
            localField: '_id',
            foreignField: 'idRepresentante',
            as: 'Representantes'
          }
        }
      ])
      /* .populate('idRepresentante', 'nombresApellidos cedula email estado')
      .populate('addedUser', 'nombresApellidos tipo email estado')
      .populate('modifiedUser', 'nombresApellidos tipo email estado')
      .populate('personaAprueba', 'nombresApellidos tipo email estado')
      .sort({ '_id': -1 })//ayuda a ordenar del ultimo registro al primero
      .skip(skip).limit(limit) */
      .exec();

    const totalContratos = await Model.countDocuments();

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalContratos
    });
  } catch (err) {
    next(new Error(err));
  }

};

exports.allByAprobadosCiudadMarca2 = async (req, res, next) => {
  const { query = {}, decoded = {} } = req;
  const { _id = null } = decoded;
  const { limit, page, skip } = paginar(query);

  const persona = await Persona.findOne({ "_id": _id });
  const role = await Role.findOne({ "_id": { $in: persona.tipo } });
  let registro = [];
  const vector = persona.idMarca.forEach(x => {
    registro.push(x.toString());
  });

  try {
    let docs;
    let totalContratos;
    if (role.nombre.includes('Super')) {
      docs = await Model.find({})
        .populate('idRepresentante', 'nombresApellidos cedula email estado')
        .populate('addedUser', 'nombresApellidos tipo email estado')
        .populate('modifiedUser', 'nombresApellidos tipo email estado')
        .populate('personaAprueba', 'nombresApellidos tipo email estado')
        .sort({ '_id': -1 })//ayuda a ordenar del ultimo registro al primero
        .skip(skip).limit(limit).exec();

      totalContratos = await Model.countDocuments();

    }
    if (role.nombre.includes('Admin')) {

      docs = await Model.aggregate([
        {
          $match: {
            estado: 'Aprobado'
          }
        },
        {
          $unwind: '$marcasVendidas'
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'addedUser',
            foreignField: '_id',
            as: 'addedUser'
          }
        },
        {
          $match: {
            $and:
              [
                { 'addedUser.idCiudad': { $in: persona.idCiudad } },
                { "marcasVendidas.item_id": { $in: registro } }
              ]
          }
        }
      ])
        .skip(skip)
        .limit(limit)
        .exec();
      totalContratos = await Model.countDocuments();
    }
    if (role.nombre.includes('User') || role.nombre.includes('Docente')) {

      docs = await Model.aggregate([
        {
          $match: {
            estado: 'Aprobado'
          }
        },
        {
          $unwind: '$marcasVendidas'
        },
        {
          $lookup: {
            from: 'personas',
            localField: 'addedUser',
            foreignField: '_id',
            as: 'addedUser'
          }
        },
        {
          $match: {
            $and:
              [
                { 'addedUser.0._id': persona._id },
                { 'addedUser.idCiudad': { $in: persona.idCiudad } },
                { "marcasVendidas.item_id": { $in: registro } }
              ]
          }
        }
      ])
        .skip(skip)
        .limit(limit)
        .exec();
      totalContratos = await Model.countDocuments();
    }

    res.json({
      success: true,
      ok: "all",
      data: docs,
      totalContratos
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

exports.readDesbloqueado = async (req, res, next) => {
  const { doc = {} } = req;
  res.json({
    success: true,
    data: doc
  });
};

exports.update = async (req, res, next) => {

  const { doc = {}, body = {}, decoded = {} } = req;

  /**
   * Saber quien creo el contrato
   */
  const { _id = null } = decoded;
  if (_id) {
    body.modifiedUser = _id;
    body.fechaAprobacion = new Date();
  }
  Object.assign(doc, body);
  console.log(doc);

  try {
    //Al aprobar el contrato
    if (doc.estado === "Aprobado") {
      try {
        //obtener email del rerpesentante
        const representante = await Representante.findOne({ "_id": doc.idRepresentante });
        representante.estado = "Activo";
        representante.save();
        //Enviar correo electronico al representante
        /* envioEmail.transporter.sendMail({
          from: USER_EMAIL,
          to: ['davidtamayoromo@gmail.com', representante.email],
          subject: `Prueba envio de correo al aprobar contrato ${representante.nombresApellidos}`,
          attachments: [
            {
              //TODO:Enviar archivo pdf del contrato
              filename: 'redes.pdf', // <= Here: made sure file name match
              path: path.join(__dirname, '../archivospdf/redes.pdf'), // <= Here
              contentType: 'application/pdf'
            }
          ]
        }) */
        //obtener estudiantes del contrato
        const estudiantes = await Estudiante.find({ "idRepresentante": representante._id });

        let index = 0;
        estudiantes.forEach(async (estudiante) => {
          /* Se modifica para que cada director active los estudiantes
          estudiante.estado = "Activo";
          estudiante.save(); */

          //Enviar link de llenar peea del estudiante
          //El peea lo realiza el representante
          //TODO: Controlar link para enviar el peea q corresponda solo hay q mover al apartado de programa que esta en las lineas siguientes
          //de codigo, ahi esta el programa del estudiante
          try {

            const esperar = await envioEmail.transporter.sendMail({
              from: USER_EMAIL,
              to: ['davidtamayoromo@gmail.com', representante.email],
              subject: `PEEA ${estudiante.nombresApellidos}`,
              html: `<div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:16px\"><span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">Estimado/a; ${representante.nombresApellidos}, reciba nuestra m??s cordial bienvenida a nuestro centro de entrenamiento. </span></span><br></div><div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:16px\"><span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">Es importante para el proceso que se llene la siguiente informacion, clic en el boton para llenar el formulario<br><a href='https://app.corporacionjetmind.com/peea-17-ch-uk/nuevo/${doc._id}'>Clic aqui para Llenar PEEA</a></span></span></div><div><br></div><div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:13.3333px\"><span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">Nota: Este es un correo autom??tico, por favor no responder. Si tiene alguna duda o pregunta, comunicarse con su asesor comercial para que ??ste le ayude con su solicitud.</span></span><br></div>`
            });
            //If necesario para esperar la respuesta del envio del email
            if (esperar != null) {
              console.log('Esperando respuesta del envio del email');
            } else {
              console.log('Enviado email');
            }
          } catch (error) {

          }

          const programa = await Programa.findOne({ "idEstudiante": estudiante._id });

          //enviar correo a los admin de la marca que corresponde el contrato
          const personas = await Persona.aggregate([
            {
              $match: {
                $and: [
                  { idCiudad: { $in: programa.idCiudad } },
                  { idMarca: { $in: programa.idMarca } },
                  { idSucursal: { $in: programa.idSucursal } },
                ]
              }
            },
          ]);

          personas.forEach(async (persona) => {
            const role = await Role.find({ "_id": { $in: persona.tipo } });
            role.forEach(async (rol) => {
              if (rol.nombre.includes('Admin')) {
                const esperar = await envioEmail.transporter.sendMail({
                  from: USER_EMAIL,
                  to: ['davidtamayoromo@gmail.com', persona.email],
                  subject: `Nuevo contrato APROBADO  |  ${doc.codigo}`,
                  html: `<div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:16px\"><span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">Estimado/a Director: ${persona.nombresApellidos}, reciba un cordial saludo de la corporacion JETMIND. </span></span><br></div><div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:16px\"><span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">A sido aprobado el contrato con el codigo ${doc.codigo}, tomar las respectivas acciones para poner en marcha lo mas pronto posible el curso adquirido.</span></span></div><div><br></div><div style=\"text-align: justify; \"><span class=\"size\" style=\"font-size:13.3333px\"><span class=\"font\" style=\"font-family:arial, helvetica, sans-serif, sans-serif\">Nota: Este es un correo autom??tico, por favor no responder. </span></span><br></div>`
                });
                //If necesario para esperar la respuesta del envio del email
                if (esperar != null) {
                  console.log('Esperando');
                } else {
                  console.log('Enviado');
                }
              }
            });


          });


          //consulta de Director general (617c24f99f60c044346e3ffa) y Director (617c25009f60c044346e3ffc) 
          //TODO: "Estado":"Activo" aumentar esto en la consulta
          /* const persona = await Persona.find({
            "tipo": { $in: [mongoose.Types.ObjectId("617c24f99f60c044346e3ffa"), mongoose.Types.ObjectId("617c25009f60c044346e3ffc")] },
            "idMarca": { "$in": programa.idMarca }, "idCiudad": { "$in": programa.idCiudad }, "idSucursal": { "$in": programa.idSucursal }
          });*/
          /* if (persona.length > 0) {

            persona.forEach(async (pers) => {
              setTimeout(async () => {
                try {
                  //Enviar correo electronico a cada director general de la marca
                  //con await esperamos la respuesta del envio del email
                  const esperar = await envioEmail.transporter.sendMail({
                    from: USER_EMAIL,
                    to: ['davidtamayoromo@gmail.com', pers.email],
                    subject: `Prueba envio de correo al aprobar contrato ${estudiante.nombresApellidos}`,
                  });
                  //If necesario para esperar la respuesta del envio del email
                  if (esperar != null) {
                    console.log('Esperando');
                  } else {
                    console.log('Enviado');
                  }
                } catch (error) {

                }

              }, 1000);

            })

          } */
          index++;
        })
      } catch (error) {
        console.log(error);
      }
    }

    if (doc.estado === "Rechazado") {

      try {
        const representante = await Representante.findOne({ "_id": doc.idRepresentante });
        representante.estado = "Rechazado";
        representante.save();

        //obtener estudiantes del contrato
        const estudiantes = await Estudiante.find({ "idRepresentante": representante._id });

        estudiantes.forEach(async (estudiante) => {
          estudiante.estado = "Rechazado";
          estudiante.save();
        })
      } catch (error) {
        console.log(error);
      }


    }

    if (doc.estado === "Espera") {


      try {
        const representante = await Representante.findOne({ "_id": doc.idRepresentante });
        representante.estado = "Espera";
        representante.save();

        //obtener estudiantes del contrato
        const estudiantes = await Estudiante.find({ "idRepresentante": representante._id });

        estudiantes.forEach(async (estudiante) => {
          estudiante.estado = "Espera";
          estudiante.save();
        })
      } catch (error) {
        console.log(error);
      }

    }


    const update = await doc.save();
    res.json({
      success: true,
      data: update
    });


  } catch (error) {
    next(new Error(error));
  }
};

//actualizar sin notificar por correo
exports.updateSinNotificacion = async (req, res, next) => {

  const { doc = {}, body = {}, decoded = {} } = req;
  const { _id = null } = decoded;
  if (_id) {
    body.modifiedUser = _id;
  }
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

//actualizar el voucher por primera vez
exports.updateVoucher = async (req, res, next) => {
  console.log("entre a voucher");
  const { doc = {}, body = {}, decoded = {} } = req;
  const { voucher } = body;


  /**
   * Saber quien creo el contrato
   */
  const { _id = null } = decoded;
  if (_id) {
    body.modifiedUser = _id;
  }
  Object.assign(doc, body);
  //console.log(doc);


  let voucherJpg;
  let voucherNuevoNombreRandom;
  let voucherSlice;
  let arregloImg = [];
  let arregloImgT = [];

  if (voucher === null) {
    console.log('No hay voucher');
  } else {
    voucher.map(item => (
      item = item.toString(),
      voucherJpg = item.slice(22),
      voucherSlice = voucherJpg,
      voucherJpg = v4() + '.jpg',
      voucherNuevoNombreRandom = voucherJpg,
      arregloImg.push(voucherNuevoNombreRandom),
      arregloImgT.push(voucherSlice)
    ))
  }
  try {
    let pathRandom;
    let fileSliceBase64;
    let arrToSaveInDb = [];

    for (var i = 0; i < arregloImg.length; i++) {
      pathRandom = arregloImg[i],
        fileSliceBase64 = arregloImgT[i];
      fs.writeFileSync(dbPath + pathRandom, fileSliceBase64, 'base64')
      arrToSaveInDb.push(pathRandom)
    }

    doc.voucher = arrToSaveInDb;
    console.log(doc);
    const update = await doc.save();
    res.json({
      success: true,
      data: update
    });
  } catch (error) {
    next(new Error(error));
  }

};

//actualizar el voucher 
exports.updateVoucher2 = async (req, res, next) => {
  const { doc = {}, body = {}, decoded = {} } = req;
  const { voucher } = body;
  /**
   * Saber quien creo el contrato
   */
  const { _id = null } = decoded;
  if (_id) {
    body.modifiedUser = _id;
  }
  Object.assign(doc, { modifiedUser: body.modifiedUser });

  let voucherJpg;
  let voucherNuevoNombreRandom;
  let voucherSlice;
  let arregloImg = [];
  let arregloImgT = [];

  if (voucher === null) {
    console.log('No hay voucher');
  } else {
    voucher.map(item => (
      item = item.toString(),
      voucherJpg = item.slice(22),
      voucherSlice = voucherJpg,
      voucherJpg = v4() + '.jpg',
      voucherNuevoNombreRandom = voucherJpg,
      arregloImg.push(voucherNuevoNombreRandom),
      arregloImgT.push(voucherSlice)
    ))
  }
  try {
    let pathRandom;
    let fileSliceBase64;
    let arrToSaveInDb = [];

    for (var i = 0; i < arregloImg.length; i++) {
      pathRandom = arregloImg[i],
        fileSliceBase64 = arregloImgT[i];
      fs.writeFileSync(dbPath + pathRandom, fileSliceBase64, 'base64')
      arrToSaveInDb.push(pathRandom)
    }
    console.log(arrToSaveInDb);
    console.log(doc);
    arrToSaveInDb.forEach(element => {
      doc.voucher.push(element);
    });

    setTimeout(async () => {
      const update = await doc.save();

      res.json({
        success: true,
        data: update
      });
    }, 50);


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


exports.reporte_ventas = async (req, res, next) => {

  const { query = {}, body = {} } = req;
  const { fechainicio, fechafin, TipoPago = ["Plan", "Contado"], EstadoVenta = ["Ok", "Abono", "Saldo"], asesor = [], campania = [] } = body;
  console.log(TipoPago);
  console.log(EstadoVenta);

  let personaAsesor = [];
  asesor.forEach((resp) => {
    personaAsesor.push(mongoose.Types.ObjectId(resp));
  });

  let campaniaB = [];
  campania.forEach((resp) => {
    campaniaB.push(mongoose.Types.ObjectId(resp));
  });

  try {

    setTimeout(async () => {
      const docs = await Model
        .aggregate([
          //preguntar si el reporte debe ser de aprobados o de todos
          //{ $match: { createdAt: { $gte: new Date(fechainicio), $lt: new Date(fechafin) }, estado: 'Aprobado' } },
          {
            $match:
            {
              $and: [
                {
                  createdAt: {
                    $gte: new Date(fechainicio), $lt: new Date(fechafin)
                  },
                },
                {
                  tipoPago: { $in: TipoPago }
                },
                {
                  estadoVenta: { $in: EstadoVenta }
                },
                {
                  addedUser: { $in: personaAsesor }
                },
                //descomentar para presentacio jeffry y carlos
                {
                  campania: { $in: campaniaB }
                }
              ]
            }
          },
          {
            $group: {
              _id: '$addedUser',
              totalVentas: { $sum: 1 },
              montoAsesortotal: { $sum: '$valorTotal' },
              montoAsesorMatriculas: { $sum: '$valorMatricula' },
              datos: { $push: '$$ROOT' },
            },
          },
          //sumar el montoAsesortotal

        ]).exec();
      //inner join --- importante asi se une tablas 
      await Persona.populate(docs, { path: '_id' });
      //ordenar por monto total
      docs.sort((a, b) => {
        return b.montoAsesortotal - a.montoAsesortotal;
      });

      res.json({
        success: true,
        data: docs,
      });
    }, 500);


  } catch (err) {
    next(new Error(err));
  }
};
