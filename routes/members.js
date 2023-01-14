"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureCorrectGroupAdmin } = require("../middleware/auth");
const Member = require("../models/member");

const memberNewSchema = require("../schemas/memberNew.json");
const memberUpdateSchema = require("../schemas/memberUpdate.json");
const memberSearchSchema = require("../schemas/memberSearch.json");
const nodemailer = require(`nodemailer`);
const User = require("../models/user");
const Group = require("../models/group")

const router = new express.Router();

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


/** POST / { member } =>  { member }
 *
 * member should be { username, group_id}
 *
 * Returns { username, group_id}
 *
 * Authorization required: admin
 */

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, memberNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const user = await User.get(req.body.username);
    const group = await Group.get(req.body.group_id);
    const memberList = await Member.findAll(req.body.group_id)
    const isFirstMember = memberList.length === 0;
    req.body["is_first_member"] = isFirstMember;
    const member = await Member.create(req.body);
    transporter.sendMail({
      from: `"Social Saver" <socialsaver1@gmail.com`,
      to: `${user.email}`,
      subject: `Welcome to Group: ${group.title} 💸`,
      text: "You've been added to a new group! Get to saving by checking out your group's goal on Social Saver!",
      html: "<b>You've been added to a new group! Get to saving by checking out your group's goal on Social Saver!</b>"
    }).then(info => {
      console.log({info});
    }).catch(console.error);
    return res.status(201).json({ member });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { members: [ { username, group_id}, ...] }
 *
 * Can filter on provided search filters:
 * - username
 * - group_id
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;
  // arrive as strings from querystring, but we want as ints
  if (q.username !== undefined) q.username = q.username;
  if (q.group_id !== undefined) q.group_id = +q.group_id;

  try {
    const validator = jsonschema.validate(q, memberSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const members = await Member.findAll(q);
    return res.json({ members });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { member }
 *
 *  Member is { username, group_id}
 *   where groups is [{ id, title, description, target_goal }, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const member = await Member.get(req.params.id);
    return res.json({ member });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { member }
 *
 * Patches member data.
 *
 * fields can be: { username, group_id}
 *
 * Returns { username, group_id}
 *
 * Authorization required: admin
 */

router.patch("/:username", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, memberUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const member = await Member.update(req.params.handle, req.body);
    return res.json({ member });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureCorrectGroupAdmin, async function (req, res, next) {
  try {
    await Member.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
