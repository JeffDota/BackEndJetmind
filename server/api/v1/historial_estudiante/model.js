const mongoose = require("mongoose");

const { Schema } = mongoose;


const fields = {
  idEstudiantes: [
    {
      item_id: {
        type: String
      },
      nombre: {
        type: String
      },
    }
  ],
  //Activo, Espera, Congelado, Incorporado, Retirado, Rechazado | Asigando Horario, Cambio grupo
  estado: {
    type: String,
    require: false,
  },
  fechaInicioCongelacion: {
    type: Date,
    require: false,
  },
  fechaFinCongelacion: {
    type: Date,
    require: false,
  },
  ultimaAsistencia: {
    type: String,
    require: false,
  },
  fechaUltimaAsistencia: {
    type: Date,
    require: false,
  },
  fechaIncorporacion: {
    type: Date,
    require: false,
  },
  observaciones: {
    type: String,
    require: false,
  },
  docenteAsignado: {
    type: String,
    require: false,
  },
  horarioAsignado: {
    type: String,
    require: false,
  },
  addedUser: {
    type: Schema.Types.ObjectId,
    ref: 'persona',
    require: false,
  },
  modifiedUser: {
    type: Schema.Types.ObjectId,
    ref: 'persona',
    require: false,
  },
};

//timestamps es created at - updated at
const historial_estudiante = new Schema(fields, { timestamps: true });

module.exports = mongoose.model('historial_estudiante', historial_estudiante);

