import { body } from "express-validator";
import { DateTime } from "luxon";
import { appConfig } from "@/Config";

const validator = [
  body("date")
    .isString()
    .withMessage("Date should be a string")
    .custom((value) => {
      const date = DateTime.fromISO(value);

      if (!date.isValid) {
        throw new Error("Date should be a valid ISO8601 date");
      }

      return true;
    })
    .custom((value) => {
      const date = DateTime.fromISO(value);
      if (date > appConfig.CURRENT_DATE_TIME) {
        throw new Error("Date is a future date");
      }
      return true;
    }),
  body("location")
    .isString()
    .isLength({
      min: 1,
    })
    .trim()
    .escape()
    .withMessage("Location should be a valid string of at least length 1"),
];

export default validator;
