const express = require('express');
const passwordContoller = require('../controllers/Password.controller');
const router = express.Router()





// Route pour la demande de réinitialisation de mot de passe from testing account
router.route('/forgotpassword').post(passwordContoller.forgotPassword)

// Route pour la demande de réinitialisation de mot de passe from real account
router.route('/getbill').post(passwordContoller.getbill)



// Route pour réinitialiser le mot de passe
router.route('/resetPassword').post(passwordContoller.resetPassword);








module.exports = router;