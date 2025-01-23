import mongoose from 'mongoose';

const PrinterLogSchema = mongoose.Schema({
  action: {
    type:String,
    enum: ["Add","Edit","Update","Delete"],
    required:true
  },
  date:{
    type: Date,
    default: Date.now()
  },
  printer: {
    type: String,
    required:true,
  },
  Updatedby: {
    type: String,
    required:true,
    default: "admin1"
  },
  description: {
    type: String,
  }
});



const PrinterLogs = mongoose.model('PrinterLogs',PrinterLogSchema);
export default PrinterLogs;