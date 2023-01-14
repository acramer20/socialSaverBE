"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testGroupIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /groups */

describe("POST /groups", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post(`/groups`)
        .send({
          title: "J-new",
          target_goal: 10,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      group: {
        id: expect.any(Number),
        title: "J-new",
        target_goal: 10,
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post(`/groups`)
        .send({
          companyHandle: "c1",
          title: "J-new",
          target_goal: 10,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
//********************NOT SURE WHAT TO DO HERE */
  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post(`/groups`)
        .send({
          companyHandle: "c1",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post(`/groups`)
        .send({
          companyHandle: "c1",
          title: "J-new",
          target_goal: "not-a-number",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** GET /groups */

describe("GET /groups", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/groups`);
    expect(resp.body).toEqual({
          groups: [
            {
              id: expect.any(Number),
              title: "J1",
              target_goal: 1,
            },
            {
              id: expect.any(Number),
              title: "J2",
              target_goal: 2,
            },
            {
              id: expect.any(Number),
              title: "J3",
              target_goal: 3,
            },
          ],
        },
    );
  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get(`/groups`)
        .query({ hasEquity: true });
    expect(resp.body).toEqual({
          groups: [
            {
              id: expect.any(Number),
              title: "J1",
              target_group: 1,
            },
            {
              id: expect.any(Number),
              title: "J2",
              target_goal: 2,
            },
          ],
        },
    );
  });

  // test("works: filtering on 2 filters", async function () {
  //   const resp = await request(app)
  //       .get(`/jobs`)
  //       .query({ minSalary: 2, title: "3" });
  //   expect(resp.body).toEqual({
  //         jobs: [
  //           {
  //             id: expect.any(Number),
  //             title: "J3",
  //             salary: 3,
  //             equity: null,
  //             companyHandle: "c1",
  //             companyName: "C1",
  //           },
  //         ],
  //       },
  //   );
  // });

  test("bad request on invalid filter key", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .query({ minSalary: 2, nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /groups/:id */

describe("GET /groups/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/groups/${testGroupIds[0]}`);
    expect(resp.body).toEqual({
      group: {
        id: testGroupIds[0],
        title: "J1",
        target_goal: 1,
      },
    });
  });

  test("not found for no such group", async function () {
    const resp = await request(app).get(`/groups/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /groups/:id */

describe("PATCH /groups/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/groups/${testGroupIds[0]}`)
        .send({
          title: "J-New",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      group: {
        id: expect.any(Number),
        title: "J-New",
        target_goal: 1,
      },
    });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .patch(`/groups/${testGroupIds[0]}`)
        .send({
          title: "J-New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such group", async function () {
    const resp = await request(app)
        .patch(`/groups/0`)
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/groups/${testGroupIds[0]}`)
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .patch(`/groups/${testGroupIds[0]}`)
        .send({
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /groups/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/groups/${testGroupIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testGroupIds[0] });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .delete(`/groups/${testGroupIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/groups/${testGroupIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such group", async function () {
    const resp = await request(app)
        .delete(`/groups/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
