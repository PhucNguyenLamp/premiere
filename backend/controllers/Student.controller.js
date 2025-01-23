import Student from "../model/Student.model.js";
import AppError from "../utils/AppError.js";

export class StudentController {
  async getStudentInfo(req,res,next) {
    try {
      const cur_user = req.user;
      res.status(200).json({
        status:"success",
        data:{
          page_remain: cur_user.page_remain,
          bank_card: cur_user.bank_card
        }
      })
    } catch (err) {
      console.log(err.message);
      return next (new AppError(err.message,401));
    }
  }
}