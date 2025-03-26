const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection");
const seed = require('../db/seeds/seed');
// const endpointsJson = require("../endpoints.json");
const {bookingsData, servicesData, usersData} = require("../db/data/test-data/index.js");
// const {convertTimestampToDate, createRef, formatComments} = require("../db/seeds/utils.js");

beforeEach(() => seed({bookingsData, servicesData, usersData}));
afterAll(() => db.end());

describe("GET /api/health", () => {
    test("200: Responds with an object containing a message 'Server is running!'", () => {
      return request(app)
        .get("/api/health")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({ msg: "Server is running!" });
        });
    });
  });

describe("GET /api/services", () => {
    test("200: Responds with an object containing all services", () => {
      return request(app)
        .get("/api/services")
        .expect(200)
        .then((data) => {
          const servicesArr = data.body.services;
          expect(servicesArr[0].name).toBe('Full Face Painting');
          expect(servicesArr[0].duration).toBe(60);
          expect(servicesArr[0].price).toBe("50.00");
          expect(servicesArr[0].description).toBe('Complete artistic face painting for events and parties.');
        });
    });
  });

  describe("POST /api/users", () => {
    test("return the new user", () => {
        const userObj = {
            name: "Tasos",
            email: "tasos@gmail.com",
            phone_no: "6969696969"
          };
      return request(app)
        .post("/api/users")
        .send(userObj)
        .expect(201)
        .then((res) => {
          expect(res.body.user).toMatchObject(userObj);
        });
    });
    test("POST 400: Responds with an appropriate status and error message when provided with no email", () => {
      return request(app)
        .post("/api/users")
        .send({
            name: "Tasos",
            phone_no: "6969696969"
          })
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad Request");
        });
    });
    // test("POST 404: Responds with an appropriate status and error message when provided with a bad topic (no username)", () => {
    //   return request(app)
    //     .post("/api/users")
    //     .send({
    //         name: "Tasos",
    //         email: "tasos@gmail.com",
    //         phone_no: "6969696969"
    //       })
    //     .expect(404)
    //     .then((res) => {
    //       expect(res.body.msg).toBe("User doesn't exist");
    //     });
    // });
    })