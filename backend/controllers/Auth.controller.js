import signToken from '../utils/jwtToken.js';
import AppError  from '../utils/AppError.js';
import Student from '../model/Student.model.js';
import SPSO from '../model/SPSO.model.js';
import { promisify } from 'util';
import jwt from 'jsonwebtoken'


export class AuthController {
  async login (req,res,next) {
    const {username, password, role} = req.body;
    if(!username || !password) {
      return next(new AppError("Please provide username or password!",400));
    }
    let user = {}; 
    if(role=="Student"){
      const email=`${username}@hcmut.edu.vn`;
      user = await Student.findOne({email}).select('+password');
      if(!user || !await user.correctPassword(password,user.password)) {
        return next(new AppError("Incorrect username or password",401));
      }
    } else if(role=="SPSO") {
      user = await SPSO.findOne({username}).select('+password');
      if(!user || !await user.correctPassword(password,user.password)) {
        return next(new AppError("Incorrect username or password",401));
      }
    };
    signToken(user,200,res);
  
  }

  async isLoggedin(req,res,next) {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if(!token) {
      return next(new AppError("You are not logged in !! Please log in again",401));
    }
    try{
      const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
      const {id,role} = decoded;
      let user ={};
      if(role==="SPSO") {
        user = await SPSO.findById(id);
      } else if (role==="Student") {
        user = await Student.findById(id);
      }
      if(!user) {
        return next( new AppError('The token belonging to this user no longer exist.',401));
      }
      req.user=user;
      req.role=role;
      next();
      // res.status(200).json({
      //   status:"success"
      // });
      
    } catch(err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError("Your session has expired. Please log in again",401));
      } else {
        return next(new AppError("You are not logged in !! Please log in again", 401));
      }
    }
  }
}



