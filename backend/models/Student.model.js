import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const StudentSchema = mongoose.Schema ({
  ID: {
    type: Number,
    required:[true,"Student ID is required"],
    unique:true
  },
  lname: {
    type: String,
    required:[true,"LName is required"]
  },
  fname: {
    type:String
  },
  email: {
    type: String,
    required:[true,"Email is required"],
    unique:true,
    validate:[validator.isEmail, "Please provide valid email"]
  },
  password: {
    type:String,
    required: [true,"Password is required"],
    minlength: [8, "Password have at least 8 characters"],
    maxlength: [16],
    select:false
  },
  page_remain: {
    type:Number,
    required:[true,"Email is required"],
    default:50
  },
  last_login: {
    type: Date,
    default: undefined
  },
  role: {
    type:String,
    required:true,
    default: "Student"
  },
  bank_card: {
    type:String,
    required:true
  },
  bank_name: {
    type:String
  }
}, {
  timestamps:true
}); 

StudentSchema.pre('save', async function(next) {
  if(this.password.length > 16) return next();
  
  this.password= await bcrypt.hash(this.password,12);

  next();

});

StudentSchema.methods.correctPassword = async function(CheckPassword,userPassword) {
  return await bcrypt.compare(CheckPassword,userPassword);
}

const Student = mongoose.model('Student',StudentSchema);

export default Student;