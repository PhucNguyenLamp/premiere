import mongoose from "mongoose";
import Student from "./Student.model.js";
import Document from "./Document.model.js";
import Printer from "./Printer.model.js";

const PrintOrderSchema = mongoose.Schema({
  Student: {
    type: mongoose.Schema.ObjectId,
    ref: "Student",
    required: true,
  },
  Document: {
    type: mongoose.Schema.ObjectId,
    ref: "Document",
    required: true,
  },
  Printer: {
    type: mongoose.Schema.ObjectId,
    ref: "Printer",
    required:true
  },
  date: {
    type: Date,
    default: Date.now()
  },
  configuration: {
    copy: {
      type: Number,
      required: true,
      default: 1,
    },
    typeface: {
      type: Number,
      enum: [1, 2],
      required: true,
      default: 1,
    },
    vector: {
      type: String,
      enum: ["Portrait", "Landscape"],
      required: true,
    },
    papersize: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    required: true,
    default: "Pending" 
  }
});

PrintOrderSchema.pre(/^find/, function(next){
  this
  .populate({
    path:'Student'
  })
  .populate({
    path:'Document'
  })
  .populate({
    path:'Printer'
  });

  next();
});

PrintOrderSchema.post(/^find/, function (docs, next) {
  const filteredDocs = docs.filter(doc => doc.Printer !== null);
  docs.splice(0, docs.length, ...filteredDocs);

  next();
});

const PrintOrder = mongoose.model('PrintOrder',PrintOrderSchema);

export default PrintOrder;