const express = require('express');
const operationContoller = require('../controllers/Operation.controller');
const { verifyToken, verifyResponsable } = require('../Middleware/middleware');
const router = express.Router()


//recupere un user
router.route('/getAllOperations').get(verifyToken,verifyResponsable,operationContoller.getAllOperations)
router.route('/deleteOperation/:operation_id').delete(verifyToken,verifyResponsable,operationContoller.deleteOperation)

module.exports = router;
