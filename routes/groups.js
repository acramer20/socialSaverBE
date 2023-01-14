"use strict";

/** Routes for groups. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureCorrectGroupAdmin } = require("../middleware/auth");
const Group = require("../models/group");
const groupNewSchema = require("../schemas/groupNew.json");
const groupUpdateSchema = require("../schemas/groupUpdate.json");
const groupSearchSchema = require("../schemas/groupSearch.json");
const Member = require("../models/member");

const router = express.Router({ mergeParams: true });


/** POST / { group } => { group }
 *
 * group should be { title, description, target_goal }
 *
 * Returns { id, title, ddescription, target_goal }
 *
 * Authorization required: admin
 */

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, groupNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    
    const group = await Group.create(req.body);
    const adminMember = await Member.create({group_id: group.id, username: res.locals.user.username, is_first_member: true})
    console.log(group);
    return res.status(201).json({ group });
  } catch (err) {
    return next(err);
  }
});

/** GET / =>
 *   { groups: [ { id, title, target_goal}, ...] }
 *
 * Can provide search filter in query:
 * - title (will find case-insensitive, partial matches)

 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;
  // arrive as strings from querystring, but we want as int/bool
  // if (q.title !== undefined) q.title = +q.title;

  try {

    // const validator = jsonschema.validate(q, groupSearchSchema);
    // if (!validator.valid) {
    //   const errs = validator.errors.map(e => e.stack);
    //   throw new BadRequestError(errs);
    // }
    console.log(q)
    const groups = await Group.findAll(q);
    return res.json({ groups });
  } catch (err) {
    return next(err);
  }
});

/** GET /[groupId] => { group }
 *
 * Returns { id, title, description, target_goal }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const group = await Group.get(req.params.id);
    return res.json({ group });
  } catch (err) {
    return next(err);
  }
});
// **********************************************************************

/** PATCH /[groupId]  { fld1, fld2, ... } => { group }
 *
 * Data can include: { title, description, target_goal }
 *
 * Returns { id, title, description, target_goal }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureCorrectGroupAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, groupUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const group = await Group.update(req.params.id, req.body);
    return res.json({ group });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: admin
 */

router.delete("/:id", ensureCorrectGroupAdmin, async function (req, res, next) {
  try {
    await Group.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
