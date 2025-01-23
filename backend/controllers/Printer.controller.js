import Printer from "../model/Printer.model.js";
import PrintOrder from "../model/PrintOrder.model.js";
import Document from "../model/Document.model.js";
import AppError from "../utils/AppError.js";
import PrinterLogs from "../model/PrinterLogs.model.js";
import get_standard_datetime from "../utils/getDateTime.js";

export class PrinterController {
  async getPrinterInfo(req, res, next) {
    try {
      const { id } = req.params;
      const printer = await Printer.findOne({ id }).select(
        "+update +printing_ink +image"
      );
      if (!printer) {
        return res.status(404).json({
          status: "error",
          message: "Printer not found!",
        });
      }
      const printed_count = await PrintOrder.countDocuments({
        Printer: printer._id,
      });
      const document_printed = await Document.find({ Printer: printer._id });
      const paged_printed = document_printed.reduce((result, doc) => {
        return result + doc.page_count;
      }, 0);
      const printerinfo = {
        name: `${printer.brand} - ${printer.model}`,
        campus: printer.location.campus,
        building: printer.location.building,
        room: printer.location.room,
        description: printer.description,
        status: printer.status,
        update: printer.update,
        printed_count,
        paged_printed,
        printingInk: printer.printing_ink,
        image: printer.image,
      };
      res.status(200).json({
        status: "success",
        printerinfo,
      });
    } catch (err) {
      return next(new AppError("Something went wrong", 400));
    }
  }
  async getAllPrinters(req, res, next) {
    try {
      const { search } = req.query;
      let query = {};
      if (search) {
        query.$or = [
          { model: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
        ];
      }
      const printers = await Printer.find(query);
      res.status(200).json({
        status: "success",
        results: printers.length,
        data: printers,
      });
    } catch (err) {
      next(new AppError("Unable to fetch printers", 500));
    }
  }

  async getPrinterLog(req, res, next) {
    try {
      const logs = await PrinterLogs.find();
      const printerlogs=logs.map((element) => {
        const plainObject = element.toObject();
        return ({
          ...plainObject,
          date: get_standard_datetime(plainObject.date)
        })
      });
      res.status(200).json({
        status: "success",
        printerlogs,
      });
    } catch (err) {
      console.log(err.message);
      return next(new AppError(err.message, 401));
    }
  }

  async addPrinter(req, res, next) {
    try {
      const { brand, model, campus, building, room, description } = req.body;
      if (!brand || !model || !campus || !building || !room) {
        return next(new AppError("Vui lòng điền đầy đủ thông tin", 400));
      }
      let { ID } = req.body;
      if (!ID) {
        const printer_count = (await Printer.countDocuments({ brand })) + 1;
        ID = brand.slice(0, 2) + printer_count.toString();
      }
      const anyprinter = await Printer.countDocuments({ brand, model });
      if (anyprinter > 0) {
        return next(new AppError("You already have this printer", 401));
      }
      const printerData = {
        id: ID,
        brand,
        model,
        location: {
          campus: `CS${campus}`,
          building,
          room,
        },
        description,
        status: true,
      };

      const newPrinter = await Printer.create(printerData);

      //Printer Logs
      const newlog = {
        action: "Add",
        printer: `${brand}-${model}`,
      };

      await PrinterLogs.create(newlog);

      res.status(201).json({
        status: "success",
        message: "Printer added successfully!",
        data: newPrinter,
      });
    } catch (err) {
      if (err.message.includes("duplicate"))
        return next(new AppError("ID can not be duplicated", 401));
      next(new AppError(err.message, 400));
    }
  }

  async updatePrinter(req, res, next) {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      const printername = updatedData.name.split(" - ");
      const updatedatamodel = {
        brand: printername[0],
        model: printername[1],
        location: {
          building: updatedData.building,
          room: updatedData.room,
          campus: updatedData.campus,
        },
        description: updatedData.description,
        status: updatedData.status,
      };
      let cur_printer = await Printer.findOne({ id });

      const fields = [
        { key: "brand", label: "thương hiệu " },
        { key: "model", label: "mã máy " },
        { key: "location", label: "vị trí " },
      ];

      let editnote = fields.reduce((note, field) => {
        return cur_printer[field.key] !== updatedatamodel[field.key]
          ? note + (note ? ", " : "") + field.label
          : note;
      }, "");

      if (cur_printer) {
        cur_printer.set(updatedatamodel);
        await cur_printer.save();
      } else {
        return res.status(404).json({
          status: "error",
          message: "Printer not found!",
        });
      }

      //Printer Logs
      const newlog = {
        action: "Edit",
        printer: `${printername[0]}-${printername[1]}`,
        description: `Thay đổi thông tin ${editnote}`,
      };

      await PrinterLogs.create(newlog);

      res.status(200).json({
        status: "success",
        message: "Printer updated successfully!",
      });
    } catch (err) {
      next(new AppError(err.message, 400));
    }
  }

  async updateDriver(req, res, next) {
    try {
      const { id } = req.params;
      const printer = await Printer.findOne({ id }).select("+update");
      if (!printer) {
        return res.status(404).json({
          status: "error",
          message: "Printer not found!",
        });
      }
      printer.update = !printer.update;

      await printer.save();

      //Printer Logs
      const newlog = {
        action: "Update",
        printer: `${printer.brand}-${printer.model}`,
        description: "Cập nhật driver mới nhất",
      };

      await PrinterLogs.create(newlog);

      res.status(200).json({
        status: "success",
        message: "Update driver successfully!",
        printer,
      });
    } catch (err) {
      return next(
        new AppError("Update driver failed! Some errors occurred!", 400)
      );
    }
  }

  async deletePrinter(req, res, next) {
    try {
      const { id } = req.params;

      const printer = await Printer.findOne({ id });
      const result = await Printer.deleteOne({ id });

      if (result.deletedCount === 0) {
        return next(new AppError("Printer not found", 404));
      }

      //Printer Logs
      const newlog = {
        action: "Delete",
        printer: `${printer.brand}-${printer.model}`,
      };

      await PrinterLogs.create(newlog);

      res.status(200).json({
        status: "success",
        message: "Printer deleted successfully!",
      });
    } catch (err) {
      next(new AppError("Failed to delete printer", 400));
    }
  }

  async togglePrinterStatus(req, res, next) {
    try {
      const { id } = req.params;

      const printer = await Printer.findOne({ id });

      if (!printer) {
        return next(new AppError("Printer not found", 404));
      }

      printer.status = !printer.status;
      await printer.save();

      //Printer Logs
      const newlog = {
        action: "Update",
        printer: `${printer.brand}-${printer.model}`,
        description: printer.status ? "Bật máy in" : "Tắt máy in",
      };

      await PrinterLogs.create(newlog);

      res.status(200).json({
        status: "success",
        message: `Printer status toggled to ${
          printer.status ? "enabled" : "disabled"
        }`,
        printer,
      });
    } catch (err) {
      next(new AppError("Failed to toggle printer status", 400));
    }
  }
}

export default new PrinterController();
