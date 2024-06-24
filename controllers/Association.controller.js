const Association = require("../model/association");
const User = require("../model/user");
const Pass = require("../model/dailyPass");
// Importer le module bcrypt pour le hachage des mots de passe
const bcrypt = require('bcryptjs')
const qr = require('qrcode'); 

const AssociationContoller = {
  getAssociationRepaDetails: async (req, res) => {
    const associationId = req.params.associationId;

    try {
        // Récupérer l'association avec ses patients
        const association = await Association.findById(associationId).populate('patients');
        if (!association) {
            return res.status(404).send('Association not found');
        }

        // Récupérer les IDs des patients
        const patientIds = association.patients.map(patient => patient._id);

        // Agrégation pour calculer les repas reçus par mois pour chaque patient
        const result = await User.aggregate([
            {
                $match: { 
                    _id: { $in: patientIds }
                }
            },
            {
                $addFields: {
                    registeredDate: { $toDate: "$registered" }
                }
            },
            {
                $group: {
                    _id: {
                        patientId: "$_id",
                        email: "$email", // Ajout de l'e-mail du patient
                        month: { $month: "$registeredDate" }
                    },
                    totalRepaRecu: { $sum: "$repasRecu" }
                }
            },
            {
                $group: {
                    _id: "$_id.patientId",
                    email: { $first: "$_id.email" }, // Prendre le premier e-mail
                    monthlyRepas: {
                        $push: {
                            month: "$_id.month",
                            totalRepaRecu: "$totalRepaRecu"
                        }
                    },
                    totalRepaRecu: { $sum: "$totalRepaRecu" }
                }
            },
            {
                $project: {
                    patientId: "$_id",
                    email: 1,
                    monthlyRepas: 1,
                    totalRepaRecu: 1,
                    _id: 0
                }
            }
        ]);

        // Calculez le total global de tous les repas
        const globalTotal = result.reduce((acc, curr) => acc + curr.totalRepaRecu, 0);

        console.log(result);
        res.json({ clients: result, globalTotal: globalTotal }); // Envoyez la réponse
    } catch (err) {
        console.error('Error in aggregation:', err);
        res.status(500).send('Internal Server Error'); // Envoyez une réponse d'erreur
    }
}
,
  currentAdmin: async(req,res) =>{
    try {

      const userId = req.user.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  currentResponsable: async(req,res) =>{
    try {

      const userId = req.user.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getPatientById: async (req, res) => {
    const { patientId } = req.params;

    try {
        const patient = await User.findById(patientId);

        if (!patient) {
            return res.status(404).json({ message: 'Patient non trouvé' });
        }

        res.status(200).json(patient);
    } catch (error) {
        console.error('Erreur lors de la récupération du patient :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
},

  addpatient: async (req, res) => {
    try {
      const { firstname, lastname, password, repeatpassword, email, address, ville, phone, gender, disabilityType } = req.body;

      // Vérifiez si le mot de passe et le mot de passe répété correspondent
      if (password !== repeatpassword) {
        return res.status(400).json({ success: false, message: "Les mots de passe ne correspondent pas." });
      }
  
      // Vérifiez si le mot de passe a au moins 8 caractères
      if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Le mot de passe doit contenir au moins 8 caractères." });
      }
  
      // Générer le sel et hacher le mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Créez un nouvel utilisateur
      const newUser = new User({
        firstname,
        lastname,
        password: hashedPassword, // Utilisation du mot de passe haché
        email,
        role: 'user', // Je suppose que le rôle par défaut est 'user'
        address,
        ville,
        phone,
        gender,
        disabilityType
      });
  
      // Enregistrez le nouvel utilisateur dans la base de données
      await newUser.save();

      // Générez le QRData basé sur l'ID de l'utilisateur nouvellement créé
      const qrdata = await generateQRData(newUser._id);

      // Mettez à jour le champ QRData de l'utilisateur avec la valeur générée
      newUser.qrdata = qrdata;
      newUser.repasRecu = 0;

      await newUser.save();

      // Si l'utilisateur a choisi un pays lors de l'inscription, ajoutez cet utilisateur à la liste des patients de l'association correspondante
      if (ville) {
        const association = await Association.findOneAndUpdate(
          { ville }, // Rechercher une association avec le même pays
          { $push: { patients: newUser._id } }, // Ajouter l'utilisateur à la liste des patients
          { new: true }
        );

        if (!association) {
          console.error("Association non trouvée.");
          return res.status(404).json({ message: "Association non trouvée." });
        }
      }

      // Réponse réussie
      res.status(201).json({ success: true, message: "Patient ajouté avec succès.", user: newUser });
    } catch (error) {
      // En cas d'erreur, renvoyer une réponse d'erreur
      console.error(error);
      res.status(500).json({ success: false, message: "Une erreur s'est produite lors de l'ajout du patient." });
    }
  },
  
  
  deletepatient: async (req, res) => {
    const { id } = req.params;

    try {
        // Vérifiez si l'utilisateur existe dans la base de données
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifiez si l'utilisateur est un patient de l'association
        if (!user.role === 'patient') {
            return res.status(403).json({ message: 'Cet utilisateur n\'est pas un patient' });
        }

        // Supprimez l'utilisateur de la liste des patients de l'association
        await Association.updateMany(
            { patients: id },
            { $pull: { patients: id } }
        );

        // Supprimez l'utilisateur de la base de données
        await User.findByIdAndDelete(id);

        res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la suppression de l\'utilisateur : ', err);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }
},
 updatepatient: async (req, res) => {
  const { id } = req.params;
  const {
      firstname,
      lastname,
      email,
      address,
      ville,
      phone,
      gender,
      disabilityType
  } = req.body;

  try {
      const user = await User.findById(id);

      if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Mettre à jour les champs spécifiés
      if (firstname) user.firstname = firstname;
      if (lastname) user.lastname = lastname;
      if (email) user.email = email;
      if (address) user.address = address;
      if (ville) user.ville = ville;
      if (phone) user.phone = phone;
      if (gender) user.gender = gender;
      if (disabilityType) user.disabilityType = disabilityType;

      await user.save();

      res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur : ', err);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
} ,
  //admin
  getAdminAssociationDetails: async (req, res) => {
    try {
      console.log(req.params.id)
      const association = await Association.findOne({ admin: req.params.id }).populate([
        {
          path: "admin",
          model: "User",
          select: "-password",
        },
        {
          path: "responsable",
          model: "User",
          select: "-password",
        },
        {
          path: "patients",
          model: "User",
          select: "-password",
        },
     ]);
      if (!association) {
        res.status(404).json({ message: "Association non trouvée." });
      } else {

        res.status(200).json(association);
      }
    } catch (error) {
      console.error(error)

      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  },

  
  //responsable
  getResponsableAssociationDetails: async (req, res) => {
    try {
      const association = await Association.findOne({
        responsable: req.params.id,
      }).populate([
        // {
        //   path: "admin",
        //   model: "User",
        //   select: "-password",
        // },
        // {
        //   path: "responsable",
        //   model: "User",
        //   select: "-password",
        // },
        {
          path: "patients",
          model: "User",
          select: "-password",
        },
     ]);
      if (!association) {
        res.status(404).json({ message: "Association non trouvée." });
      } else {
        res.status(200).json(association);
      }
    } catch (error) {
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  },
  addPatientPass: async (req, res) => {
    try {
      const association_id = req.params.id;
      console.log(association_id);
      const patientEmail = req.body.email;
  
      // Vérifier si l'association existe
      const existingAssociation = await Association.findById(association_id);
      if (!existingAssociation) {
        return res.status(404).json({ message: "Association non trouvée." });
      }
  
      // Vérifier si l'utilisateur existe avec l'email spécifié
      const patientUser = await User.findOne({ email: patientEmail });
      if (!patientUser) {
        return res.status(404).json({ message: "Le patient n'est pas trouvé." });
      }
  
      // Vérifier si le patient est déjà associé à cette association
      if (!existingAssociation.patients.includes(patientUser._id)) {
        // Si le patient n'est pas déjà associé, l'ajouter à l'association
        existingAssociation.patients.push(patientUser._id);
        await existingAssociation.save();
      }
  
      // Créer un nouveau laissez-passer pour l'utilisateur et l'association
      await Pass.create({
        association_id,
        patient_id: patientUser._id,
        pass: 3,
      });
  
      res.status(200).json({ message: "Succès" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  }
  ,
  deletePatientPass: async (req, res) => {
    try {
        const associationId = req.params.id;
        const patientEmail = req.body.email;

        // Vérifier si l'utilisateur existe avec l'e-mail spécifié
        const patientUser = await User.findOne({ email: patientEmail });
        if (!patientUser) {
            return res.status(404).json({ message: "Le patient n'est pas trouvé." });
        }

        // Supprimer le laissez-passer quotidien du patient pour cette association
        const deletedPass = await Pass.findOneAndDelete({ association_id: associationId, patient_id: patientUser._id });
        if (!deletedPass) {
            return res.status(404).json({ message: "Le laissez-passer quotidien du patient pour cette association n'est pas trouvé." });
        }

        res.status(200).json({ message: "Succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
}


  ,
//   getPatientAssociationByville: async (req, res) => {
//     try {
//         const { ville } = req.params; 

//         const patientsByCity = await Association.aggregate([
//             { $match: { ville } }, // Filtrer les associations par pays
//             { $unwind: "$patients" }, // Déplier le tableau de patients
//             {
//                 $lookup: {
//                     from: "users", // Nom de la collection des utilisateurs
//                     localField: "patients",
//                     foreignField: "_id",
//                     as: "patientInfo"
//                 }
//             },
//             { $unwind: "$patientInfo" }, // Déplier les informations du patient
//             {
//                 $group: {
//                     _id: "$patientInfo.ville", // Regrouper les patients par ville
//                     patients: { $addToSet: "$patientInfo" } // Ajouter les patients à un tableau sans doublons
//                 }
//             }
//         ]);

//         res.json(patientsByCity);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Une erreur s'est produite lors de la récupération des patients par ville." });
//     }
// }
// ,

//adminGlobal
  getPatientAssociationDetails: async (req, res) => {
    try {
      const association = await Association.findOne({
        patients: req.params.id,
      }).populate([
        {
          path: "admin",
          model: "User",
          select: "-password",
        },
        {
          path: "responsable",
          model: "User",
          select: "-password",
        },
        {
          path: "patients",
          model: "User",
          select: "-password",
        },
     ]);
      if (!association) {
        res.status(404).json({ message: "Association non trouvée." });
      } else {
        res.status(200).json(association);
      }
    } catch (error) {
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  },

  getAllAssociationsDetails: async (req, res) => {
    try {
      const associations = await Association.find().populate([
        {
          path: "admin",
          model: "User",
          select: "-password",
        },
        {
          path: "responsable",
          model: "User",
          select: "-password",
        },
        {
          path: "patients",
          model: "User",
          select: "-password",
        },
     ]);
       console.log('Association:', associations);

      if (!associations || associations.length === 0) {
        res.status(404).json({ message: "Aucune association non trouvée." });
      } else {
        res.status(200).json(associations);
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  },
  getAssociationId: async (req, res) => {
    try {
      const associationId = req.params.associationId;
  
      const association = await Association.findById(associationId).populate([
        {
          path: "admin",
          model: "User",
          select: "email",
        },
        {
          path: "responsable",
          model: "User",
          select: "email",
        },
        {
          path: "patients",
          model: "User",
          select: "-password",
        },
      ]);
  
      // Vérifier si l'association existe
      if (!association) {
        return res.status(404).json({ message: "Association non trouvée." });
      }
  
      // Construire la réponse en sélectionnant uniquement les champs 'email' pour le responsable et l'administrateur
      const associationResponse = {
        _id: association._id,
        name: association.name,
        description: association.description,
        responsable: association.responsable ? association.responsable.email : null,
        admin: association.admin ? association.admin.email : null,
        patients: association.patients,
        ville: association.ville,
        region: association.region,
        zip_code: association.zip_code,
        __v: association.__v
      };
  
      // Retourner les détails de l'association
      res.status(200).json(associationResponse);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  } ,
  addAssociation: async (req, res) => {
    try {
      const { name, description, responsable, admin,adminGlobal, ville, region, zip_code} = req.body;
  
      // Check if the association already exists
      const existingAssociation = await Association.findOne({ ville });
      if (existingAssociation) {
        return res.status(400).json({ message: "Cette association existe déjà!" });
      }
  
      // Find the responsible and admin users
      const responsableUser = await User.findOne({ email: responsable });
      if (!responsableUser) {
        return res.status(400).json({ message: "Le responsable est requis!" });
      }
      const adminUser = await User.findOne({ email: admin });
      if (!adminUser) {
        return res.status(400).json({ message: "L'admin est requis!" });
      }
      const adminGlobalUser = await User.findOne({ email: adminGlobal });
      if (!adminGlobalUser) {
        return res.status(400).json({ message: "L'admin est requis!" });
      }
  
      // Create the new association
      const newAssociation = new Association({
        name,
        description,
        responsable: responsableUser._id,
        admin: adminUser._id,
        adminGlobal: adminGlobalUser._id,
        ville,
        region,
        zip_code,
      });
  
      const association = await newAssociation.save();
  
     // Get the port for the ville asynchronously
     const port = await getPortForVille(ville);
    
     // Update the URL with the association ID after it has been saved
     association.url = `${ville.toLowerCase()}.localhost:${port}`;
     await association.save();
  
      // Find the fournisseur and update it with the new association
      // const fournisseur = await Fournisseur.findById(fournisseurId);
      // if (!fournisseur) {
      //   return res.status(400).json({ message: "Le fournisseur est requis!" });
      // }
  
      // fournisseur.association.push({
      //   association: association._id,
      //   repasDistribues: repasDistribues || 0,
      //   repasRestants: repasRestants || 0,
      // });
      // await fournisseur.save();
  
      // Respond with the created association and its URL
      res.status(201).json({
        association,
        url: association.url,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  },
  updateAssociation: async (req, res) => {
    const associationId = req.params.id
    try {
      const existingAssociation = await Association.findById(associationId);
      if (!existingAssociation) {
        return res.status(404).json({ message: 'Association not found' });
      }
      let responsableUser;
      let adminUser;
      if(req.body.responsable){
        responsableUser = await User.findOne({email:req.body.responsable});
        if(!responsableUser){
          return res.status(400).json({ message: "Le responsable est requis!" });
        }
      }
      if(req.body.admin){
        adminUser = await User.findOne({email:req.body.admin});
        if(!adminUser){
          return res.status(400).json({ message: "L'admin est requis!" });
        }
      }
      existingAssociation.name = req.body.name || existingAssociation.name;
      existingAssociation.description = req.body.description || existingAssociation.description;
      existingAssociation.responsable = responsableUser ? responsableUser._id : existingAssociation.responsable;
      existingAssociation.admin = adminUser ? adminUser._id : existingAssociation.admin;
      existingAssociation.ville = req.body.ville || existingAssociation.ville;
      existingAssociation.region = req.body.region || existingAssociation.region;
      existingAssociation.zip_code = req.body.zip_code || existingAssociation.zip_code;
      existingUser.profileImage = file?.filename ?? existingUser.profileImage

      const updatedAssociation = await existingAssociation.save();

      res.status(200).json({ updatedAssociation });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: " Server Error" });
    }
  },
  deleteAssociation: async (req, res) => {
    try {
      const associationId = req.params.id;
      const deleteAssociation = await Association.findByIdAndDelete(associationId);
      if (!deleteAssociation) {
        res.status(404).json({ message: "Association non trouvé." });
      }
      res.status(200).json({ message: "Association supprimee avec succes" });

    } catch (error) {
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  }, 
   
  
};
// // Fonction pour générer le QRData
// async function generateQRData(userId) {
//   try {
//     // Générez le QRData en utilisant l'ID de l'utilisateur
//     const qrData = await qr.toDataURL(userId.toString());

//     // Retournez le QRData généré
//     return qrData;
//   } catch (error) {
//     // En cas d'erreur, renvoyez null ou gérez l'erreur comme requis
//     console.error("Erreur lors de la génération du QRData :", error);
//     return null;
//   }
// }

// Fonction pour générer le QRData
async function generateQRData(userId) {
  try {
    // Générez le QRData en utilisant l'ID de l'utilisateur
    const qrData = await qr.toDataURL(userId.toString());

    // Retournez le QRData généré
    return qrData;
  } catch (error) {
    // En cas d'erreur, renvoyez null ou gérez l'erreur comme requis
    console.error("Erreur lors de la génération du QRData :", error);
    return null;
  }}

  // Exemple de fonction asynchrone pour récupérer le port en fonction de la ville
// async function getPortForVille(ville) {
//   try {
//       // Exemple: requête asynchrone pour récupérer le port en fonction de la ville
//       if (ville === 'Medenine') {
//           return 4200;
//       } else if (ville === 'Gabes') {
//           return 4400;
//       }
//       // Default port if ville is not recognized
//       return 4200; // Adjust default port as needed
//   } catch (error) {
//       console.error(`Erreur lors de la récupération du port pour ${ville}:`, error);
//       throw error; // Lancer l'erreur pour la gérer plus haut si nécessaire
//   }
// }
async function getPortForVille(ville) {
  try {
    // Mapping des villes aux ports correspondants
    const villePortMap = {
      "Medenine": 4200,
      "Gabes": 4400,
      "Ariana": 4300,
      "Beja": 4500,
      "Ben Arous": 4600,
      "Bizerte": 4700,
      "Gafsa": 4800,
      "Jendouba": 4900,
      "Kairouan": 5000,
      "Kasserine": 5100,
      "Kebili": 5200,
      "Le Kef": 5300,
      "Mahdia": 5400,
      "La Manouba": 5500,
      "Monastir": 5600,
      "Nabeul": 5700,
      "Sfax": 5800,
      "Sidi Bouzid": 5900,
      "Siliana": 6000,
      "Sousse": 6100,
      "Tataouine": 6200,
      "Tozeur": 6300,
      "Tunis": 6400,
      "Zaghouan": 6500,
    };

    // Vérifier si la ville est dans la carte et retourner le port correspondant
    if (villePortMap.hasOwnProperty(ville)) {
      return villePortMap[ville];
    } else {
      // Si la ville n'est pas trouvée, retourner un port par défaut
      return 4200; // ou tout autre port par défaut que vous souhaitez définir
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération du port pour ${ville}:`, error);
    throw error; // Lancer l'erreur pour la gérer plus haut si nécessaire
  }
}


module.exports = AssociationContoller;
