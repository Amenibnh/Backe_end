//imports the Mongoose library
const mongoose = require("mongoose");

//creates a new Mongoose schema
const DailyPassSchema = new mongoose.Schema({
    association_id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Association',
      required: false
    },
    patient_id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required: false,
      unique:true
    },
    pass:{
        type:Number,
        min:[0,'Le pass doit etre superieur ou égale à 0'],
        max:[3,'Le pass doit etre inferieur ou égale à 3'],
        default:3,
    },
});


module.exports = mongoose.model('DailyPass', DailyPassSchema);