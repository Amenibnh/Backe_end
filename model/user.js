const mongoose = require("mongoose");
const association = require("./association");


const userSchema = new mongoose.Schema({
  firstname: { type: String, required: false },
  lastname: { type: String, required: false },
  password: { type: String, required: false },
  email: { type: String, required: true ,unique:true},
  role: {
    type: String,
    enum: ['user', 'admin', 'responsable', 'adminGlobal'],
    default: 'user'
  },
  address: { type: String, required: false },
  country: { type: String, required: false },
  phone: { type: String, required: false },
  profileImage: { type: String, required: false, default: "default-user-icon-8.jpg" },
  qrdata: { type: String, required: false },
  activity: { type: String, required: false }, // dernière connexion
  lastLogout: { type: String, required: false },// dernière déconnexion
  registered: { type: String, required: false }, // Date d'enregistrement
  usage: [{ type: Number }], // Tableau de pourcentages d'utilisation pour chaque mois
  period: { type: String, required: false }, // Période
  sessions: { type: Number, default: 0 }, // Nombre total de connexion
  gender: { type: String, enum: ['Male', 'Female'] },
  disabilityType: { type: String, enum: ['physical', 'visual', 'hearing', 'cognitive'] },
  status: {
    type: String,
    enum: ['connected', 'disconnected'],
    default: 'disconnected'
  },
  repasRecu: {
    type:Number,
        min:[0,'Le pass doit etre superieur ou égale à 0'],
        default:0,
  },
  association:{
    type:mongoose.Schema.Types.ObjectId,
     ref:'Association',
    },
  

});


module.exports = mongoose.model('User', userSchema);