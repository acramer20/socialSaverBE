"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newGroup = {
    title: "Test",
    target_goal: 100,
  };

  test("works", async function () {
    let group = await Group.create(newGroup);
    expect(group).toEqual({
      ...newGroup,
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

// describe("findAll", function () {
//   test("works: no filter", async function () {
//     let jobs = await Job.findAll();
//     expect(jobs).toEqual([
//       {
//         id: testJobIds[0],
//         title: "Job1",
//         salary: 100,
//         equity: "0.1",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//       {
//         id: testJobIds[1],
//         title: "Job2",
//         salary: 200,
//         equity: "0.2",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//       {
//         id: testJobIds[2],
//         title: "Job3",
//         salary: 300,
//         equity: "0",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//       {
//         id: testJobIds[3],
//         title: "Job4",
//         salary: null,
//         equity: null,
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//     ]);
//   });

//   test("works: by min salary", async function () {
//     let jobs = await Job.findAll({ minSalary: 250 });
//     expect(jobs).toEqual([
//       {
//         id: testJobIds[2],
//         title: "Job3",
//         salary: 300,
//         equity: "0",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//     ]);
//   });

//   test("works: by equity", async function () {
//     let jobs = await Job.findAll({ hasEquity: true });
//     expect(jobs).toEqual([
//       {
//         id: testJobIds[0],
//         title: "Job1",
//         salary: 100,
//         equity: "0.1",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//       {
//         id: testJobIds[1],
//         title: "Job2",
//         salary: 200,
//         equity: "0.2",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//     ]);
//   });

//   test("works: by min salary & equity", async function () {
//     let jobs = await Job.findAll({ minSalary: 150, hasEquity: true });
//     expect(jobs).toEqual([
//       {
//         id: testJobIds[1],
//         title: "Job2",
//         salary: 200,
//         equity: "0.2",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//     ]);
//   });

//   test("works: by name", async function () {
//     let jobs = await Job.findAll({ title: "ob1" });
//     expect(jobs).toEqual([
//       {
//         id: testJobIds[0],
//         title: "Job1",
//         salary: 100,
//         equity: "0.1",
//         companyHandle: "c1",
//         companyName: "C1",
//       },
//     ]);
//   });
// });

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let group = await Group.get(testGroupIds[0]);
    expect(job).toEqual({
      id: testGroupIds[0],
      title: "Job1",
      target_goal: 100,
    });
  });

  test("not found if no such group", async function () {
    try {
      await Group.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let updateData = {
    title: "New",
    target_goal: 500,
  };
  test("works", async function () {
    let group = await Group.update(testGroupIds[0], updateData);
    expect(job).toEqual({
      id: testGroupIds[0],
      ...updateData,
    });
  });

  test("not found if no such group", async function () {
    try {
      await Group.update(0, {
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Group.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Group.remove(testGroupIds[0]);
    const res = await db.query(
        "SELECT id FROM groups WHERE id=$1", [testGroupIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such group", async function () {
    try {
      await Group.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
