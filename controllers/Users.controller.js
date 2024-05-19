const User = require("../model/user");
const Association=require("../model/association");
// Importer le module bcrypt pour le hachage des mots de passe
const bcrypt = require('bcryptjs');

// Importer le module jwt pour la gestion des jetons d'authentification
const jwt = require("jsonwebtoken");
const qr = require('qrcode'); 

const usersContoller = {
  login: async (req, res) => {
    try {
      const { password, email } = req.body
      // console.log(email)

      const user = await User.findOne({ email })
      if (!user) {
        console.log("i am here in 404");
        return res.status(404).json({ message: "user not found" })
      }

      //verifier si le mdp est correct
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }
      // Mettre à jour l'activité de la dernière connexion de l'utilisateur
      user.activity = new Date();
      user.sessions += 1;
      user.status = 'connected';
      // Date actuelle
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const monthsRemaining = 12 - currentMonth; // Nombre de mois restants dans l'année

      // Calcul du pourcentage d'utilisation pour le mois actuel
      const usagePercentage = Math.round((user.sessions / (monthsRemaining + 1)) * 100);

      // Limiter le pourcentage d'utilisation à 100%
      const cappedUsagePercentage = Math.min(usagePercentage, 100);

      // Réinitialiser le nombre de sessions à zéro si nous sommes au début d'un nouveau mois
      if (currentDate.getDate() === 1) {
        user.sessions = 0;
      }

      user.usage = cappedUsagePercentage; // Stocker la valeur numérique




      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };



      // Obtenez le dernier et 1er  jour du mois actuel
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const lastDayOfMonthString = lastDayOfMonth.toLocaleDateString('fr-FR', options);
      const FirstDayOfMonthString = firstDayOfMonth.toLocaleDateString('fr-FR', options);

      period = `${FirstDayOfMonthString} - ${lastDayOfMonthString}`;
      user.period = period;

      await user.save();

      // Utilisez une clé secrète pour signer le token
      const secretKey = 'your-secret-key';
      // Si le mot de passe est correct, générer un token JWT
      const token = jwt.sign({ userId: user._id, role: user.role, usage: user.usage, period: user.period }, secretKey);
      return res.status(202).json({/* user,*/ token, role: user.role });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  getTotalRepaPerMonth: async (req, res) => {
    try {
      const result = await User.aggregate([
          {
              $match: { role: "user" } // Filter to include only users with the role 'user'
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
                      month: { $month: "$registeredDate" }
                  },
                  totalRepaRecu: { $sum: "$repasRecu" }
              }
          },
          {
              $project: {
                  patientId: "$_id.patientId",
                  month: "$_id.month",
                  totalRepaRecu: 1,
                  _id: 0
              }
          },
          {
              $sort: { "month": 1, "patientId": 1 } // Sort by month and patientId in ascending order
          }
      ]);

      console.log(result);
      res.json(result); // Send the response
  } catch (err) {
      console.error('Error in aggregation:', err);
      res.status(500).send('Internal Server Error'); // Send error response
  }
  },

  getLoggedInUser: async (req, res) => {
    try {

      const userId = req.user.userId;

      // Fetch the user based on the user ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return the user 
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getAllUsers: async (req, res) => {

    try {
      const responseData = {};

      const users = await User.find().select('-password');

      //count Recurring users
      const totalCount = users.length;

      //%female & %male
      const maleCount = users.filter(user => user.gender === 'Male').length;
      const femaleCount = users.filter(user => user.gender === 'Female').length;
      const malePercentage = (maleCount / totalCount) * 100;
      const femalePercentage = (femaleCount / totalCount) * 100;

      // Count new users (registered)
      const currentTime = new Date();
      const today = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());

      let newUsersCount = 0;

      users.forEach(user => {
        const userRegisteredDate = new Date(user.registered);

        if (userRegisteredDate.getTime() === today.getTime()) {
          newUsersCount++;
        }
      })

      //reponse
      responseData.users = users;
      responseData.totalCount = totalCount;
      responseData.newUsersCount = newUsersCount;
      responseData.malePercentage = malePercentage;
      responseData.femalePercentage = femalePercentage;
      return res.json(responseData);

      // return res.json({ users: users });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: " Server Error" });
    }
  },

  deleteUser: async (req, res) => {
    const userId = req.params.userId ?? req.user.userId
    try {
      // Rechercher le User par son ID
      const existingUser = await User.findById(userId).lean();

      // Vérifier si le User existe
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Supprimer le User par son ID et récupérer l'objet supprimé
      const deletedUser = await User.findByIdAndDelete(userId);

      // Vérifier si la suppression a réussi
      if (!deletedUser) {
        return res.status(500).json({ message: 'Failed to delete user' });
      }

      // Renvoyer l'objet supprimé en réponse
      res.json({ deletedUser, message: "user deleted successfully" });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updateUser: async (req, res) => {
    const { file } = req
    // Récupérer l'ID du user à partir des paramètres de la requête
    const userId = req.params.userId ?? req.user.userId
    try {
      // Rechercher le user par son ID
      const existingUser = await User.findById(userId);

      // Vérifier si le user existe
      if (!existingUser) {
        return res.status(404).json({ message: 'user not found' });
      }

      // Mettre à jour les propriétés du user
      existingUser.firstname = req.body.firstname || existingUser.firstname;
      existingUser.lastname = req.body.lastname || existingUser.lastname;
      existingUser.password = req.body.password || existingUser.password;
      existingUser.repeatpassword = req.body.repeatpassword || existingUser.repeatpassword;
      existingUser.email = req.body.email || existingUser.email;
      existingUser.role = req.body.role || existingUser.role;
      existingUser.country = req.body.country || existingUser.country;
      existingUser.phone = req.body.phone || existingUser.phone;
      existingUser.profileImage = file?.filename ?? existingUser.profileImage
      // Enregistrer le user mis à jour dans la base de données
      const updatedUser = await existingUser.save();
      // Renvoyer le user mis à jour en réponse
      res.status(200).json({ updatedUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: " Server Error" });
    }
  },

  getUserId: async (req, res) => {
    const userId = req.params.userId ?? req.user.userId
    try {
      const user = await User.findById(userId).lean();
      if (!user) {
        return res.json({ message: "User not found!" });
      }
      return res.json({ user: user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: " Server Error" });
    }
  },






  logout: async (req, res) => {
    try {
      const userId = req.user.userId; // Récupérer l'ID de l'utilisateur à partir du jeton d'authentification
      const user = await User.findById(userId);
      user.lastLogout = new Date(); // Ajouter la date de logout
      user.status = 'disconnected';
      await user.save();

      // Renvoyer une réponse de succès
      return res.status(200).json({ message: 'Déconnexion réussie' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Une erreur est survenue lors de la déconnexion' });
    }
  },



  register: async (req, res) => {

    try {
      // Générer un sel pour le hachage du mot de passe
      var salt = bcrypt.genSaltSync(10);

      // Extraire les données de la requête body (destructuration)
      const { firstname, lastname, password, repeatpassword, email, role, address, country, phone, gender,disabilityType } = req.body


      // Définir le nombre de tours pour le hachage du mot de passe
      const saltRounds = 10;

      // Vérifier si le mot de passe et la confirmation sont identiques
      const verifPassword = password === repeatpassword;

      // Vérifier si l'email existe déjà dans la base de données
      const verif = await User.findOne({ email })

      // Si l'email existe déjà, renvoyer une réponse d'erreur
      if (verif) {
        return res.status(409).json({ message: "Cet utilisateur avec cette adresse email existe déjà." });
      }
      // Si le mot de passe et la confirmation ne correspondent pas, renvoyer une réponse d'erreur
      else if (!verifPassword) {
        return res.status(400).json({ message: "Veuillez vous assurer que le nouveau mot de passe et la confirmation du mot de passe sont identiques" })
      }
      // Si tout est correct, créer un nouvel utilisateur
      else {
        //------------------------------------------------------------
        const user = new User({
          firstname,
          lastname,
          password,
          email,
          role,
          address,
          phone,
          registered: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          gender,
          country,
          disabilityType,
          repasRecu:0
        })

        // Générer le sel et hacher le mot de passe
        bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Affecter le mot de passe haché à l'utilisateur
        user.password = hashedPassword;
        // Enregistrer l'utilisateur dans la base de données
        const newUser = await user.save();

        const qrData = await generateQRData(newUser._id);
        // Mettez à jour le champ QRData de l'utilisateur avec la valeur générée
        newUser.qrdata = qrData; // Utilisez qrData, pas qrdata
        await newUser.save();
        

        // Si l'utilisateur a choisi un pays lors de l'inscription, ajoutez cet utilisateur à la liste des patients de l'association correspondante
        if (country ) {
            const association = await Association.findOneAndUpdate(
                { country }, // Rechercher une association avec le même pays
                { $push: { patients: newUser._id } }, // Ajouter l'utilisateur à la liste des patients
                { new: true }
            );

            if (!association) {
                console.error("Association non trouvée.");
                return res.status(404).json({ message: "Association non trouvée." });
            }
        }

        return res.status(200).json({ message: "L'utilisateur a été ajouté avec succès", newUser });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Une erreur est survenue lors de l\'ajout de l\'utilisateur' });
    }
  },


};
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
  }
}
module.exports = usersContoller

