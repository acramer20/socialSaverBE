"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Member {
  /** Create a member (from data), update db, return new member data.
   *
   * data should be { username, group_id }
   *
   * Returns { username, group_id }
   *
   * Throws BadRequestError if member already in database.
   * */

  static async create({ username, group_id, is_first_member}) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM members
           WHERE username = $1 AND group_id = $2`,
        [username, group_id]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate member: ${username}`);

    const result = await db.query(
          `INSERT INTO members
           (username, group_id, admin)
           VALUES ($1, $2, $3)
           RETURNING username, group_id, admin`,
        [
          username,
          group_id,
          is_first_member,
        ],
    );
    const member = result.rows[0];

    return member;
  }

  // /** Find all members (optional filter on searchFilters).
  //  *
  //  * searchFilters (all optional):
  //  * - username
  //  * - group_id
  //  *
  //  * Returns [{ username, group_id }, ...]
  //  * */

  static async findAll(searchFilters = {}) {
    let query = `SELECT id,
                        username,
                        group_id,
                        admin
                 FROM members`;
    let whereExpressions = [];
    let queryValues = [];

    const { username, group_id } = searchFilters;

    // For each possible search term, add to whereExpressions and queryValues so
    // we can generate the right SQL

    if (username !== undefined) {
      queryValues.push(username);
      whereExpressions.push(`username = $${queryValues.length}`);
    }

    if (group_id !== undefined) {
      queryValues.push(group_id);
      whereExpressions.push(`group_id = $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY username";
    const membersRes = await db.query(query, queryValues);
    return membersRes.rows;
  }

//************************************************************************************************************

  /** Given a member id, return data about member.
   *
   * Returns { username, group_id, groups }
   *   where jobs is [{ id, title, salary, equity }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const memberRes = await db.query(
          `SELECT id,
                  username,
                  group_id
           FROM members
           WHERE id = $1`,
        [id]);

    const member = memberRes.rows[0];

    if (!member) throw new NotFoundError(`No member with id: ${id}.`);

    const groupsRes = await db.query(
      `SELECT id, title, target_goal
       FROM groups
       WHERE id = $1
       ORDER BY id`,
    [member.group_id],
);

member["groups"] = groupsRes.rows;

    return member;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(username, group_id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const usernameVarIdx = "$" + (values.length + 1);
    const groupIdVarIdx = "$" + (values.length + 2);

    const querySql = `UPDATE members 
                      SET ${setCols} 
                      WHERE username = ${usernameIdVarIdx} AND grouop_id = ${groupIdVarIdx}
                      RETURNING username, 
                                group_id`;
    const result = await db.query(querySql, [...values, username, group_id]);
    const member = result.rows[0];

    if (!member) throw new NotFoundError(`No member with username, ${username} and group ID, ${group_id}`);

    return member;
  }
  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

   static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM members
           WHERE id = $1 
           RETURNING id`,
        [id]);
    const member = result.rows[0];

    if (!member) throw new NotFoundError(`No member: ${id}`);
  }
  
}


module.exports = Member;
