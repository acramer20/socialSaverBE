const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testGroupIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM members");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  // await db.query(`
  //   INSERT INTO members (username, group_id)
  //   VALUES ('m1', 1),
  //          ('m2', 2)`);

  const resultsGroups = await db.query(`
    INSERT INTO groups (title, target_goal)
    VALUES ('Group1', 100),
           ('Group2', 200)
    RETURNING id`);
  testGroupIds.splice(0, 0, ...resultsGroups.rows.map(r => r.id));

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);
//********** Had to change what wass applications into members and got rid of the company table all together. I am worried that might really change the other js files.  */
  await db.query(`
        INSERT INTO members(username, group_id)
        VALUES ('u1', $1)`,
      [testGroupIds[0]]);
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


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testGroupIds,
};