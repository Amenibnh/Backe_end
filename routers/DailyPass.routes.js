const express = require('express');
const dailyPassContoller = require('../controllers/DailyPass.controller');
const { verifyToken, verifyAdmin, verifyResponsable, verifyAdminGlobal } = require('../Middleware/middleware');
const router = express.Router()

// dailypass
router.route('/getAllAssociationDailyPass2/:association_id').get(verifyToken,verifyResponsable,dailyPassContoller.getAllAssociationDailyPass2)


router.route('/getAllAssociationDailyPass/:association_id').get(verifyToken,dailyPassContoller.getAllAssociationDailyPass)

router.route('/updatePatientDailyPass/:id').put(verifyToken,verifyAdmin,dailyPassContoller.updatePatientDailyPass)

router.route('/getPatientDailyPass/:id').get(verifyToken,verifyResponsable,dailyPassContoller.getPatientDailyPass)

router.route('/scanQR').post(verifyToken,verifyResponsable,dailyPassContoller.scanQR)


// //ajouter un dailypass
// // router.route('/addDailyPass').post(verifyToken,verifyAdmin,dailyPassContoller.addDailyPass)
//recuperer tous les dailypass
// router.route('/getAllDailyPass').get(verifyToken,verifyAdmin,dailyPassContoller.getAllDailyPass)
// //recuperer un dailypass
// router.route('/getDailyPass/:DailyPassId').get(verifyToken,verifyAdmin,dailyPassContoller.getDailyPass)
// //update un dailypass
// router.route('/updateDailyPass/:DailyPassId').put(verifyToken,verifyAdmin,dailyPassContoller.updateDailyPass)
// //delete un dailypass
// router.route('/deleteDailyPass/:DailyPassId').delete(verifyToken,verifyAdmin,dailyPassContoller.deleteDailyPass)

// router.route('/scanQRCode').post(verifyToken,verifyAdmin,dailyPassContoller.scanQRCode)
module.exports = router;
