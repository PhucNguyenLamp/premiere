import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const SPSOSchema = mongoose.Schema ({
  ID: {
    type: Number,
    required:[true,"Student ID is required"],
    unique:true
  },
  name: {
    type:String
  },
  email: {
    type: String,
    required:[true,"Email is required"],
    unique:true,
    validate:[validator.isEmail, "Please provide valid email"]
  },
  username: {
    type:String,
    unique:true,
    required: [true,"Username is required"]
  },
  password: {
    type:String,
    required: [true,"Password is required"],
    minlength: [8, "Password have at least 8 characters"],
    maxlength: 16,
    select:false
  },
  phone_number: {
    type:String,
    required: [true]
  },
  last_login: {
    type: Date,
    default: undefined
  }, 
  role: {
    type:String,
    default: "SPSO"
  }
}, {
  timestamps:true
}); 



SPSOSchema.pre('save', async function(next) {
  if(this.password.length > 16) return next();
  
  this.password= await bcrypt.hash(this.password,12);

  next();

});
SPSOSchema.methods.correctPassword = async function(CheckPassword,userPassword) {
  return await bcrypt.compare(CheckPassword,userPassword);
}
const SPSO = mongoose.model('SPSO',SPSOSchema);

export default SPSO;