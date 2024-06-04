const express = require('express');
const fournisseurContoller = require('../controllers/Fournisseur.controller');
const { verifyToken, verifyAdmin, verifyResponsable, verifyAdminGlobal } = require('../Middleware/middleware');
const router = express.Router()



// router.route('/fournisseur').post(verifyToken,verifyAdminGlobal,fournisseurContoller.addfournisseur)
// router.route('/fournisseur/:id/associations/:assocId').put(verifyToken,verifyAdminGlobal,fournisseurContoller.updateRepaAssoFournisseur)
// router.route('/fournisseur/:id/distribute').post(verifyToken,verifyAdminGlobal,fournisseurContoller.addRepaAsso)
// router.route('/fournisseur/:id').get(verifyToken,verifyAdminGlobal,fournisseurContoller.getFournisseur)

module.exports = router;



