const Pass = require("../model/dailyPass")
const User = require('../model/user');
const DailyPass = require('../model/dailyPass');
const Operation = require("../model/Operation");

const dailyPassContoller = {
    scanQR: async (req, res) => {
        const { qrCode } = req.body;

        try {
            const user = await User.findById(qrCode);
            if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            const dailyPass = await DailyPass.findOne({ patient_id: user._id });
            if (!dailyPass) return res.status(404).json({ message: 'DailyPass non trouvé.' });
            if (dailyPass.pass > 0) {
                dailyPass.pass -= 1;
                await dailyPass.save();
                user.repasRecu += 1;
                await user.save();
                const count = await Operation.countDocuments()
                const operation = await Operation.create({
                    dailyPass_id: dailyPass._id,
                    number: count + 1
                })
                await operation.populate([
                    {
                        path: 'dailyPass_id',
                        model: 'DailyPass',
                        populate: [
                            {
                                path: 'patient_id',
                                model: 'User',
                                select: '-password'
                            },
                            {
                                path: 'association_id',
                                model: 'Association',
                            },
                        ]
                    },
                ]);
                return res.status(200).json({ message: 'L\'utilisateur est autorisé à prendre un repas.', operation });
            } else {
                return res.status(403).json({ message: 'L\'utilisateur n\'est plus autorisé à prendre de repas pour aujourd\'hui.' });
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du DailyPass :', error);
            return res.status(500).json({ message: 'Une erreur est survenue lors de la vérification du DailyPass.' });
        }

    },

    getPatientDailyPass: async (req, res) => {
        try {
            const patient_id = req.params.id
            const dailyPass = await Pass.find({ patient_id }).populate([
                {
                    path: 'patient_id',
                    model: 'User',
                    select: '-password'
                },
                {
                    path: 'association_id',
                    model: 'Association',
                },
            ]);
            return res.json({ dailypass: dailyPass });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: " Server Error" });
        }
    },

    updatePatientDailyPass: async (req, res) => {
        try {
            const pass = req.body.pass
            const patient_id = req.params.id
            const dailyPass = await Pass.findOneAndUpdate({ patient_id }, { pass });
            if (!dailyPass) {
                return res.status(404).json({ message: "Pass n'est pas trouvée!" });
            }
            await dailyPass.populate([
                {
                    path: 'patient_id',
                    model: 'User',
                    select: '-password'
                },
                {
                    path: 'association_id',
                    model: 'Association',
                },
            ]);
            return res.json({ dailypass: dailyPass });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: " Server Error" });
        }
    },
    getAllAssociationDailyPass: async (req, res) => {
        try {
            const association_id = req.params.association_id
            const dailyPass = await Pass.find({ association_id }).populate([
                {
                    path: 'patient_id',
                    model: 'User',
                    select: '-password'
                },
                {
                    path: 'association_id',
                    model: 'Association',
                },
            ]);
            return res.json({ dailypass: dailyPass });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: " Server Error" });
        }
    },
    getAllAssociationDailyPass2: async (req, res) => {
        try {
            const association_id = req.params.association_id
            const dailyPass = await Pass.find({ association_id }).populate([
                {
                    path: 'patient_id',
                    model: 'User',
                    select: '-password'
                },
                {
                    path: 'association_id',
                    model: 'Association',
                },
            ]);
            return res.json({ dailypass: dailyPass });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: " Server Error" });
        }
    },


};

module.exports = dailyPassContoller

// getAllDailyPass: async (req, res) => {
//     try {
//       //
//       const dailyPass= await Pass.find().populate([{
//         path:'userId',
//         model:'Users',
//         select:'-password'
//       },'repaId']
//     );
//       return res.json({ dailypass: dailyPass });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: " Server Error" });
//     }
//   },
// getDailyPass: async (req, res) => {
//     try {
//       // Récupérer l'ID du DailyPass à partir des paramètres de la requête
//       const DailyPassId = req.params.DailyPassId;

//       // Rechercher le DailyPass par son ID
//       const existingDailyPass = await Pass .findById(DailyPassId);

//       // Vérifier si le DailyPass existe
//       if (!existingDailyPass) {
//         return res.status(404).json({ message: 'DailyPass not found' });
//       }

//       // Renvoyer le DailyPass en réponse
//       res.status(200).json({dailyPass:existingDailyPass});
//     } catch (error) {
//       // Gérer les erreurs
//       console.error('Error fetching DailyPass:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   },
//   updateDailyPass: async (req, res) => {
//     // Récupérer l'ID du DailyPass à partir des paramètres de la requête
//     const DailyPassId = req.params.DailyPassId;
//     // Obtenir la date actuelle
//     const date = new Date();

//     // Rechercher le DailyPass par son ID
//     const existingDailyPass = await Pass.findById(DailyPassId);

//     // Vérifier si le DailyPass existe
//     if (!existingDailyPass) {
//       return res.status(404).json({ message: 'DailyPass not found' });
//     }
//     if(existingDailyPass.userId=!req.user.userId||req.user.role!='admin'||req.user.role!='responsable'){
//       return res.status(403).json({message:'unauthorized!'})
//     }
//     // Mettre à jour les propriétés du DailyPass
//     existingDailyPass.date = date || existingDailyPass.date;

//     // Enregistrer le DailyPass mis à jour dans la base de données
//     const updatedDailyPass = await existingDailyPass.save();

//     // Renvoyer le DailyPass mis à jour en réponse
//     res.status(200).json({dailypass:updatedDailyPass});
//   },
//   deleteDailyPass: async (req, res) => {
//     // Récupérer l'ID du DailyPass à partir des paramètres de la requête
//     const DailyPassId = req.params.DailyPassId;

//     try {
//       // Rechercher le DailyPass par son ID
//       const existingDailyPass = await Pass.findById(DailyPassId);

//       // Vérifier si le DailyPass existe
//       if (!existingDailyPass) {
//         return res.status(404).json({ message: 'DailyPass not found' });
//       }
//       if(existingDailyPass.userId=!req.user.userId||req.user.role!='admin'||req.user.role!='responsable'){
//         return res.status(403).json({message:'unauthorized!'})
//       }

//       // Supprimer le DailyPass par son ID et récupérer l'objet supprimé
//       const deletedPass = await Pass.findByIdAndDelete(DailyPassId);
//       // Renvoyer l'objet supprimé en réponse
//       res.json(deletedPass);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   },
//   addDailyPass:async (req, res) => {
//     // Destructuration de propriétés de req.body
//     const { userId, repaId } = req.body
//     date = new Date();
//     try {
//       // Vérifier si un DailyPass avec la même userId et repaId existe déjà
//       const existingPass = await Pass.findOne({ userId, repaId });
//       if (existingPass) {
//         // Si un DailyPass existe déjà, renvoyer un message indiquant qu'il a déjà été trouvé
//         return res.status(400).json({ message: 'DailyPass already exists for this user and repa' });
//       }

//       const newPass = new Pass({
//         date,
//         userId,
//         repaId
//       });

//       // Save the Repas to the database
//       await newPass.save();

//       res.status(201).json({ message: 'DailyPass created successfully', Pass });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'An error occurred while creating the DailyPass' });
//     }
//   },

// //   a chaque scanne de code qr le nombre de pass ++ et aussi ++

//   scanQRCode: async(req,res) => {
//     try{
//     const todayPasses=await Pass.find({userId,date:{$gte:new Date().getHours(0,0,0,0)}}).countDocuments();

//     if(todayPasses<3){
//       await Pass.create({userId,repaId,pass:1});
//       console.log("Pass ajoute avec sucees!");

//       const repas=await repas.findById(repaId);
//       if(repas){
//         repas.Repasrecu++;
//         await repas.save();
//         console.log("Repas recu avec succes!");
//       }
//     }else{
//       console.log("limite de passes atteinte pour ajoued'hui!");
//     }


//   }catch(error){
//       console.error("Erreur lors du scan du code QR:",error);
//     }
//   }