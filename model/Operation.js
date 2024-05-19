const mongoose = require("mongoose");

const OperationSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true
    },
    dailyPass_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'DailyPass',
        // required: true,
      },
}, { timestamps: true }
);
module.exports = mongoose.model('Operation', OperationSchema);