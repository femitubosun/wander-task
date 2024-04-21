import { body } from "express-validator";

const validator = [
  body("date", "Date should be a valid ISO8601 date").isString().isISO8601(),
  body("location").isString(),
];

export default validator;
