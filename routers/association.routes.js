// const {uploadImages}=require('../Middleware/uploader')
const express=require('express');
const associationContoller=require('../controllers/Association.controller');
const { verifyToken, verifyAdmin, verifyResponsable, verifyAdminGlobal } = require('../Middleware/middleware');
const router=express.Router();

//admin


router.route('/currentAdmin').get(verifyToken,associationContoller.currentAdmin)
router.route('/getPatientById/:patientId').get(verifyToken,verifyAdmin,associationContoller.getPatientById)

router.route('/getAssociationRepaDetails/:associationId').get(verifyToken, verifyAdmin, associationContoller.getAssociationRepaDetails)





router.route('/getAdminAssociationDetails/:id').get(verifyToken,verifyAdmin,associationContoller.getAdminAssociationDetails)
router.route('/addpatient').post(verifyToken,verifyAdmin,associationContoller.addpatient)
router.route('/updatepatient/:id').put(verifyToken,verifyAdmin,associationContoller.updatepatient)
router.route('/deletepatient/:id').delete(verifyToken,verifyAdmin,associationContoller.deletepatient)






//responsable
router.route('/currentResponsable').get(verifyToken,associationContoller.currentResponsable)
router.route('/getResponsableAssociationDetails/:id').get(verifyToken,associationContoller.getResponsableAssociationDetails)
router.route('/addPatientPass/:id').post(verifyToken,verifyResponsable,associationContoller.addPatientPass)
router.route('/deletePatientPass/:id').delete(verifyToken,verifyResponsable,associationContoller.deletePatientPass)
//afficher par ville une personne en difficulte
// router.route('/getPatientAssociationByville/:ville').get(verifyToken,verifyResponsable,associationContoller.getPatientAssociationByville)

//patient
router.route('/getPatientAssociationDetails/:id').get(verifyToken,associationContoller.getPatientAssociationDetails)




 //for global admin
router.route('/getAllAssociationsDetails').get(verifyToken,verifyAdminGlobal,associationContoller.getAllAssociationsDetails)
router.route('/getAssociationId/:associationId').get(verifyToken,verifyAdminGlobal,associationContoller.getAssociationId)
router.route('/addAssociation').post(verifyToken,verifyAdminGlobal,associationContoller.addAssociation)
// router.route('/association/:subdomain').get(verifyToken,verifyAdminGlobal,associationContoller.getAssociationBySubdomain)
router.route('/updateAssociation/:id').put(verifyToken,verifyAdminGlobal,associationContoller.updateAssociation)
router.route('/deleteAssociation/:id').delete(verifyToken,verifyAdminGlobal,associationContoller.deleteAssociation)





module.exports= router;