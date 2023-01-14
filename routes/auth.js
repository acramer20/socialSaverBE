"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const nodemailer = require(`nodemailer`);
const { BadRequestError } = require("../expressError");

/** setting up nodemailer transporter 
 * 
*/

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'socialsaver1@gmail.com',
    pass: 'wgxuzhwvcplxmifk',
  },
});
transporter.verify().then(console.log).catch(console.error);

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});


/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    transporter.sendMail({
      from: `"Social Saver" <socialsaver1@gmail.com`,
      to: `${req.body.email}`,
      subject: "Registration Verification 💸",
      text: "Welcome to Social Saver! Get to saving by creating a group and goal!",
      html: "<b>Welcome to Social Saver! Get to saving by creating a group and goal!</b>"
    }).then(info => {
      console.log({info});
    }).catch(console.error);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
