const router = require('express').Router();
const controller = require('./controller');
const { auth } = require('../auth');
/**
 * /api/evaluacion/ POST - CREATE
 * /api/evaluacion/ GET - READ ALL
 * /api/evaluacion/:id GET - READ ONE
 * /api/evaluacion/:id PUT - UPDATE
 * /api/evaluacion/:id DELETE - DELETE 
 */


/**
 * @swagger
 * /evaluacion:
 *   get:
 *     tags:
 *     - "evaluacion"
 *     summary: Recuperar una lista de evaluacions formato JSON.
 *     description: Recupere una lista de usuarios de JSONPlaceholder. Se puede usar para completar una lista de usuarios falsos al crear prototipos o probar una API.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The evaluacion ID.
 *                         example: 0
 *                       title:
 *                         type: string
 *                         description: The user's name.
 *                         example: Leanne Graham
 *   post:
 *     tags:
 *     - "evaluacion"
 *     summary: "Agregar una nueva evaluacion"
 *     description: "Creacion de una nueva evaluacion"
 *     operationId: "addevaluacion"
 *     consumes:
 *     - "application/json"
 *     - "application/xml"
 *     produces:
 *     - "application/xml"
 *     - "application/json"
 *     parameters:
 *     - in: "body"
 *       name: "body"
 *       description: "Objeto con los atributos de cada evaluacion"
 *       required: true
 *       schema:
 *        type: object
 *     responses:
*       "200":
 *          description: "successful operation"
 *       "400":
 *          description: "Invalid ID supplied"
 *       "404":
 *          description: "evaluacion not found"
 * 
 * /evaluacion/{id}:
 *   get:
 *     tags:
 *     - "evaluacion"
 *     summary: Recupera una evaluacion al enviar un ID.
 *     description: Muestra una evaluacion de la que enviamos un ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la evaluacion.
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *          description: "successful operation"
 *       "400":
 *          description: "Invalid ID supplied"
 *       "404":
 *          description: "evaluacion not found"
 *   put:
 *     tags:
 *     - "evaluacion"
 *     summary: "Agregar una nueva evaluacion"
 *     description: "Creacion de una nueva evaluacion"
 *     operationId: "addevaluacion"
 *     consumes:
 *     - "application/json"
 *     - "application/xml"
 *     produces:
 *     - "application/xml"
 *     - "application/json"
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       required: true
 *       description: "Id de la evaluacion a mdificar"
 *     - in: "body"
 *       name: "body"
 *       description: "Objeto con los atributos de cada evaluacion"
 *       required: true
 *       schema:
 *        type: object
 *     responses:
*       "200":
 *          description: "successful operation"
 *       "400":
 *          description: "Invalid ID supplied"
 *       "404":
 *          description: "evaluacion not found"
 *
 *   delete:
 *     tags:
 *     - "evaluacion"
 *     summary: "Eliminar evaluacion"
 *     description: "Eliminar"
 *     operationId: "deleteevaluacion"
 *     produces:
 *     - "application/xml"
 *     - "application/json"
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       required: true
 *       description: "Id de la evaluacion a mdificar"
 *     responses:
 *       "200":
 *          description: "successful operation"
 *       "400":
 *          description: "Invalid ID supplied"
 *       "404":
 *          description: "evaluacion not found"
 */

router
  .route('/')
  .post(controller.create)
  .get(auth, controller.all);

router
  .route('/AllByIdEstudiante/:idEstudiante')
  .get(auth, controller.AllByIdEstudiante);

router.param('id', controller.id);

router
  .route('/:id')
  .get(auth, controller.read)
  .put(auth, controller.update)
  .delete(auth, controller.delete);

module.exports = router;
