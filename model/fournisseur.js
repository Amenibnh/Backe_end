const mongoose = require ("mongoose");
const association = require("./association");

const FournisseurSchema=new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  association:[{
    association:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"association",
      required: true
    },
    repasDistribues:{
      type:Number,
      default: 0,
      min: [0, 'Le nombre de repas distribues doit etre superieur ou egal à 0']
    },
    repasRestants:{
      type:Number,
      default: 0,
      min: [0, 'Le nombre de repas restants doit etre superieur ou egal à 0']
    },

  }]
});

module.exports=mongoose.model('Fournisseur', FournisseurSchema);