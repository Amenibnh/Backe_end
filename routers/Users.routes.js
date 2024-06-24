const {uploadImages}=require('../Middleware/uploader')
const express = require('express');
const usersContoller = require('../controllers/Users.controller');
const { verifyToken, verifyAdmin } = require('../Middleware/middleware');
const router = express.Router()


//recupere un user
router.route('/getUserId/:userId').get(verifyToken,verifyAdmin,usersContoller.getUserId)
//recuperer les infos de lui meme
router.route('/getUserId').get(verifyToken,usersContoller.getUserId)
//recuperer tous les users
router.route('/getAllUsers').get(verifyToken,verifyAdmin,usersContoller.getAllUsers)
//supprimer un user "user"
router.route('/deleteUser').delete(verifyToken,usersContoller.deleteUser)
//supprimer un user "admin" 
router.route('/deleteUser/:userId').delete(verifyToken,verifyAdmin,usersContoller.deleteUser)
//update profile "user"
router.route('/updateUser').put(verifyToken,uploadImages.single('profileImage'),usersContoller.updateUser)
//update profile "admin" 
router.route('/updateUser/:userId').put(verifyToken,verifyAdmin,uploadImages.single('profileImage'),usersContoller.updateUser)





//login
router.route('/login').post(usersContoller.login)
//login flutter
router.route('/login2').post(usersContoller.login2)
//sign up
router.route('/register').post(usersContoller.register)
//logout
router.route('/logout').post(verifyToken, usersContoller.logout)
router.route('/getTotalRepaPerMonth').get(verifyToken,verifyAdmin, usersContoller.getTotalRepaPerMonth)



module.exports = router;
