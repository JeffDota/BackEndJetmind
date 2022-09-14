const mongoose = require('mongoose');
const logger = require('./config/logger');
exports.connect = (
  /* {
    protocol = 'mongodb',
    url = 'mongodb+srv://db-mongodb-jetmind-e41a6a59.mongo.ondigitalocean.com',
    username = 'doadmin',
    password = '90pjq5Y782QW31ia'
  },
  options = {} */
) => {
  let dburl = '';

  //Required auth
  /* if (username && password) {
    dburl = `${protocol}://${username}:${password}@${url}`;
  } else {
    dburl = `${protocol}://${url}`;
  } */

  mongoose.connect('mongodb+srv://doadmin:AB1039N2J4Xcn6h5@db-mongodb-jetmind-28bdb3d6.mongo.ondigitalocean.com/jetmind?tls=true&authSource=admin&replicaSet=db-mongodb-jetmind', {
    /* ...options, */
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  });

  mongoose.connection.on('open', () => {
    logger.info('Base de datos conectada');
  });

  mongoose.connection.on('close', () => {
    logger.info('Base de datos desconectada');
  });

  mongoose.connection.on('error', (err) => {
    logger.info(`Error en la coneccion de Base de datos: ${err}`);
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      logger.info('Database connection disconnected through app termination');
      process.exit(0);
    });
  });

  exports.disconnect = () => {
    mongoose.connection.close(() => {
      logger.info('Base de datos desconectada')
    });
  };


}
