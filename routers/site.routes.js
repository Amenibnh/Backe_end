const express = require('express');
const siteController = require('../controllers/site.controller');
const { verifyToken, verifyAdmin, verifyResponsable, verifyAdminGlobal } = require('../Middleware/middleware');
const router = express.Router()



router.route('/updateSite/:id').put(verifyToken,verifyAdminGlobal,siteController.updateSite)
router.route('/deleteSite/:id').delete(verifyToken,verifyAdminGlobal,siteController.deleteSite)
router.route('/addSite').post(verifyToken,verifyAdminGlobal,siteController.addSite)
router.route('/getAllSites').get(verifyToken,verifyAdminGlobal,siteController.getAllSites)

module.exports = router;