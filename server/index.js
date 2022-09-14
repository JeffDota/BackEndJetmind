const express = require('express');
const morgan = require('morgan');
const requestId = require('express-request-id')();
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const logger = require('./config/logger');
const api = require('./api/v1');
const docs = require('./api/v1/docs');
const path = require('path');

// Init App
const app = express();

//directorio publico | para mostrar la vista de angular
app.use(express.static(__dirname + '/public'));

//Documentacion
app.use('/docs', swaggerUI.serve, swaggerUI.setup(docs));

//setup CORS
app.use(
  cors({
    origin: ['https://app.corporacionjetmind.com', 'https://seashell-app-u4dt5.ondigitalocean.app', 'http://localhost:4200'],
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
  })
);

//para que las ruta que contiene imagenes pase
app.use(express.json({ limit: '50mb' }));


// Setup middleware
app.use(requestId);
app.use(logger.requests);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
//parse application/json
app.use(bodyParser.json());


//Setup router and routes
app.use('/api', api);
app.use('/api/v1', api);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});


// Cuando no encuentra la ruta
// No route found handler
app.use((req, res, next) => {
  next({
    message: 'Route not found',
    statusCode: 404,
    level: 'warn',
  })
});

//Error handler
app.use((err, req, res, next) => {
  const { message, level = 'error' } = err;
  let { statusCode = 500 } = err;
  const log = `${logger.header(req)} ${statusCode} ${message}`;
  logger[level](log);

  //Valdation Errors
  if (err.message.startsWith('ValidationErorr')) {
    statusCode = 422;
  }

  res.status(statusCode);
  res.json({
    error: true,
    statusCode,
    message,
  });
});

module.exports = app;

