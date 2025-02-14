const mongoose = require("mongoose");

const AssociationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  patients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  ville: {
    type: String,
    required: false,
    enum: [
      "Ariana",
      "Beja",
      "Ben Arous",
      "Bizerte",
      "Gabes",
      "Gafsa",
      "Jendouba",
      "Kairouan",
      "Kasserine",
      "Kebili",
      "Le Kef",
      "Mahdia",
      "La Manouba",
      "Medenine",
      "Monastir",
      "Nabeul",
      "Sfax",
      "Sidi Bouzid",
      "Siliana",
      "Sousse",
      "Tataouine",
      "Tozeur",
      "Tunis",
      "Zaghouan",
    ],
    unique: true,
  },
  region: {
    type: String,
    required: false,
  },
  zip_code: {
    type: String,
    required: false,
  },
  url:{
    type: String,
    required: false,
    unique: true
  }
  // profileImage: { 
  //   type: String, 
  //   required: false, 
  //   default: "default-user-icon-8.jpg"
  //  },

});
module.exports = mongoose.model("Association", AssociationSchema);
