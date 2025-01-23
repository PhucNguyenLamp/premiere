import mongoose from 'mongoose';
import Student from './Student.model.js';

const PageOrderSchema = mongoose.Schema({
  Student:{
    type:mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true
  },
  transaction_code: {
    type:String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }, 
  papersize: {
    type: String,
    required: true
  }, 
  page_count: {
    type:Number,
    required:true
  },
  price: {
    type:String,
    required: true
  }, 
  paymentmethod: {
    type: String,
    required: true
  },
});

PageOrderSchema.pre(/^find/, function(next){
  this
  .populate({
    path:'Student'
  })
  next();
})


const PageOrder = mongoose.model('PageOrder',PageOrderSchema);

export default PageOrder;