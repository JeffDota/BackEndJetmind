const router = require('express').Router();
const controller = require('./controller');

const { auth } = require('../auth');

/**
 * /api/asistencia/ POST - CREATE
 * /api/asistencia/ GET - READ ALL
 * /api/asistencia/:id GET - READ ONE
 * /api/asistencia/:id PUT - UPDATE
 * /api/asistencia/:id DELETE - DELETE 
 */


/**
 * @swagger
 * /asistencia:
 *   get:
 *     tags:
 *     - "asistencia"
 *     summary: Recuperar una lista de asistencia formato JSON.
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
 *                         description: The task ID.
 *                         example: 0
 *                       title:
 *                         type: string
 *                         description: The user's name.
 *                         example: Leanne Graham
 *   post:
 *     tags:
 *     - "asistencia"
 *     summary: "Agregar una nueva asistencia"
 *     description: "Creacion de una nueva asistencia"
 *     operationId: "addTask"
 *     consumes:
 *     - "application/json"
 *     - "application/xml"
 *     produces:
 *     - "application/xml"
 *     - "application/json"
 *     parameters:
 *     - in: "body"
 *       name: "body"
 *       description: "Objeto con los atributos de cada asistencia"
 *       required: true
 *       schema:
 *        type: object
 *     responses:
*       "200":
 *          description: "successful operation"
 *       "400":
 *          description: "Invalid ID supplied"
 *       "404":
 *          description: "Task not found"
 * 
 * /asistencia/{id}:
 *   get:
 *     tags:
 *     - "asistencia"
 *     summary: Recupera una asistencia al enviar un ID.
 *     description: Muestra una asistencia de la que enviamos un ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la asistencia.
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *          description: "successful operation"
 *       "400":
 *          description: "Invalid ID supplied"
 *       "404":
 *          description: "Task not found"
 *   put:
 *     tags:
 *     - "asistencia"
 *     summary: "Agregar una nueva asistencia"
 *     description: "Creacion de una nueva asistencia"
 *     operationId: "addTask"
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
 *       description: "Id de la asistencia a mdificar"
 *     - in: "body"
 *       name: "body"
 *       description: "Objeto con los atributos de cada asistencia"
 *       required: true
 *       schema:
 *        type: object
 *     responses:
*       "200":
 *          description: "successful operation"
 *       "400":
 *          description: "Invalid ID supplied"
 *       "404":
 *          description: "Task not found"
 *
 *   delete:
 *     tags:
 *     - "asistencia"
 *     summary: "Eliminar asistencia"
 *     description: "Eliminar"
 *     operationId: "deleteTask"
 *     produces:
 *     - "application/xml"
 *     - "application/json"
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       required: true
 *       description: "Id de la asistencia a mdificar"
 *     responses:
 *       "200":
 *          description: "successful operation"
 *       "400":
 *          description: "Invalid ID supplied"
 *       "404":
 *          description: "Task not found"
 */

router
  .route('/')
  .post(auth, controller.create)
  .get(auth, controller.all);

router.param('id', controller.id);

router
  .route('/byEstudainte/:idEstudiante')
  .get(auth, controller.asistenciaByEstudiante);

router
  .route('/findby-ciudad-sucursal-marca')
  .post(auth, controller.findbyCiudadSucursalMarca);

router
  .route('/buscar/:idDocente/:idHorario')
  .get(auth, controller.buscarDocenteHorario)


router
  .route('/:id')
  .get(auth, controller.read)
  .put(auth, controller.update)
  .delete(auth, controller.delete);

module.exports = router;
