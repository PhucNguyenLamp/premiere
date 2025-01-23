import PrintOrder from "../model/PrintOrder.model.js";
import Document from "../model/Document.model.js";
import Student from "../model/Student.model.js";
import Printer from "../model/Printer.model.js";
import AppError from "../utils/AppError.js";
import get_standard_datetime from "../utils/getDateTime.js";

export class PrintOrderController {
  async createPrintOrder(req, res, next) {
    function getRandomStatus() {
      const statuses = ["Hoàn thành", "Đang in", "Bị hủy"];
      const randomIndex = Math.floor(Math.random() * statuses.length);
      return statuses[randomIndex];
    }
    try {
      const {
        printer,
        pageremain,
        copy,
        typeface,
        papersize,
        vector,
        filename,
        page_count,
      } = req.body;

      //Retrieve printer
      const [brand, model] = printer.split(" ");
      const cur_printer = await Printer.findOne({ brand, model });

      if (!cur_printer) {
        return next(new AppError("Printer not found", 404));
      }
      if (cur_printer.status === false) {
        return next(new AppError("Printer is unavailable", 401));
      }

      //Store new document
      const document = await Document.create({
        name: filename,
        page_count,
        Printer: cur_printer._id,
      });

      //Update page-remain of Student
      const cur_user = req.user;
      await cur_user.updateOne({ page_remain: pageremain });

      //Store new Print order

      if (!typeface || !papersize || !vector || !copy) {
        return next(
          new AppError("Please provide enough print order configuration !", 401)
        );
      }

      const printorder = {
        Student: cur_user._id,
        Document: document._id,
        Printer: cur_printer._id,
        configuration: {
          copy,
          typeface,
          vector,
          papersize,
        },
        status: getRandomStatus(),
      };

      await PrintOrder.create(printorder);

      res.status(200).json({
        status: "succes",
        message: "Print Order created successfully!",
      });
    } catch (err) {
      console.log(err.message);
      return next(new AppError(err.message, 401));
    }
  }

  async getHistoryPrintOrder(req, res, next) {
    function addHours(date, hours) {
      const newDate = new Date(date); // Tạo bản sao của ngày hiện tại
      newDate.setHours(newDate.getHours() + hours); // Cộng thêm số giờ
      return newDate;
    }
    function parseDate(dateString) {
      const [time, date] = dateString.split(" ");
      const [day, month, year] = date.split("/");

      return new Date(`${month}/${day}/${year} ${time}`);
    }

    try {
      const print_orders = await PrintOrder.find({});
      const result = [];
      let id = 1;
      
      print_orders.forEach((item) => {
        const { room, building, campus } = item.Printer.location;
        const startTime = get_standard_datetime(item.date);
        const location = `${campus}/${building}-${room}`;
        const order = {
          id: id++,
          studentID: item.Student.ID,
          startTime,
          endTime: get_standard_datetime(addHours(item.date, 3)),
          printer: item.Printer.id,
          location,
          documentName: item.Document.name,
          page_count: item.Document.page_count,
          status: item.status,
        };
        result.push(order);
      });

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (err) {
      console.log(err.message);
      return next(new AppError(err.message, 401));
    }
  }
}
