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
