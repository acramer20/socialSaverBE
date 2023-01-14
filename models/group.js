"use strict";

const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for groups */

class Group {
  /** Create a group (from data), update db, return new job data.
   *
   * data should be { title, target_goal }
   *
   * Returns { id, title, target_goal }
   **/

  static async create(data) {
    const result = await db.query(
          `INSERT INTO groups (title,
                             description,
                             target_goal
                             )
           VALUES ($1, $2, $3)
           RETURNING id, title, description, target_goal`,
        [
          data.title,
          data.description,
          data.target_goal
        ]);
    let group = result.rows[0];

    return group;
  }
//************************************************************************************************************************************** */
    /** Given a group id, return data about group.
   *
   * Returns { id, title, description, target_goal }
   *
   * Throws NotFoundError if not found.
   **/

     static async get(id) {
      const groupRes = await db.query(
            `SELECT id,
                    title,
                    description,
                    target_goal
             FROM groups
             WHERE id = $1`, [id]);
  
      const group = groupRes.rows[0];
  
      if (!group) throw new NotFoundError(`No group: ${id}`);
  
      return group;
    }

    /** given a group title, filter groups.
     * 
     * returns (id, title, description, target_goal)
     */

     static async findAll(searchFilters = {}) {
      let query = `SELECT id,
                          title,
                          description, 
                          target_goal
                   FROM groups`;
      let whereExpressions = [];
      let queryValues = [];
  
      const { title } = searchFilters;
  
      // For each possible search term, add to whereExpressions and queryValues so
      // we can generate the right SQL
  
      if (title !== undefined) {
        queryValues.push(title.toLowerCase());
        whereExpressions.push(`lower(title) = $${queryValues.length}`);
      }
  
      if (whereExpressions.length > 0) {
        query += " WHERE " + whereExpressions.join(" AND ");
      }
  
      // Finalize query and return results
  
      query += " ORDER BY title";
      const groupsRes = await db.query(query, queryValues);
      console.log(groupsRes.rows);
      return groupsRes.rows;
    }

  //************************************************************************************************************************************* */
   /** Update group data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, description, target_goal }
   *
   * Returns { id, title, description, target_goal }
   *
   * Throws NotFoundError if not found.
   */

    static async update(id, data) {
      const { setCols, values } = sqlForPartialUpdate(
          data,
          {});
      const idVarIdx = "$" + (values.length + 1);
  
      const querySql = `UPDATE groups 
                        SET ${setCols} 
                        WHERE id = ${idVarIdx} 
                        RETURNING id, 
                                  title, 
                                  description,
                                  target_goal`;
      const result = await db.query(querySql, [...values, id]);
      const group = result.rows[0];
  
      if (!group) throw new NotFoundError(`No group: ${id}`);
  
      return group;
    }
  
    /** Delete given group from database; returns undefined.
     *
     * Throws NotFoundError if group not found.
     **/
  
    static async remove(id) {
      const result = await db.query(
            `DELETE
             FROM groups
             WHERE id = $1
             RETURNING id`, [id]);
      const group = result.rows[0];
  
      if (!group) throw new NotFoundError(`No group: ${id}`);
    }

}

module.exports = Group;
