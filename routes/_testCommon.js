"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Group = require("../models/group");
const Member = require("../models/member");
const { createToken } = require("../helpers/tokens");

const testMemIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Group.create(
      {
        title: "G1",
        description: "Desc1",
        target_goal: "1000",
      });
  await Group.create(
      {
        title: "G2",
        description: "Desc2",
        target_goal: "2000",
      });
  await Group.create(
      {
        title: "G3",
        description: "Desc3",
        target_goal: "3000",
      });
 

  testMemIds[0] = (await Member.create(
      { username: "G1", group_id: 1})).id;
  testMemIds[0] = (await Member.create(
      { username: "G2", group_id: 2})).id;
  testMemIds[0] = (await Member.create(
      { username: "G3", group_id: 3})).id;

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testMemIds,
  u1Token,
  u2Token,
  adminToken,
};
