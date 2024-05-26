const mongoose = require("mongoose");

const SiteSchema=new mongoose.Schema({
  association_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Association",
    required: true
  },
  url:{
    type:String,
    required:true,
    unique:true
  }
});

module.exports = mongoose.model('Site', SiteSchema);