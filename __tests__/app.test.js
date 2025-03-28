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
    })

    describe("GET /api/users/:user_id", () => {
        test("200: Responds with a single user", () => {
          return request(app)
            .get("/api/users/1")
            .expect(200)
            .then((response) => {
              const user = response.body.user;
              expect(user.name).toBe('Alice Johnson');
              expect(user.email).toBe('alice@example.com');
              expect(user.phone_no).toBe('123-456-7890');
            });
        });
        test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
          return request(app)
            .get('/api/users/999')
            .expect(404)
            .then((response) => {
              console.log(response);
              expect(response.body.msg).toBe('No user found for user_id: 999');
            });
        });
        test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
          return request(app)
            .get('/api/users/not-a-user')
            .expect(400)
            .then((response) => {
              expect(response.body.msg).toBe('Bad Request');
            });
        });
      });

      describe("GET /api/bookings/:user_id", () => {
        test("200: Responds with all bookings", () => {
          return request(app)
            .get("/api/bookings")
            .expect(200)
            .then((response) => {
              const bookings = response.body.bookings;
              expect(bookings[0].user_id).toBe(1);
              expect(bookings[0].service_id).toBe(1);
              expect(bookings[0].status).toBe("confirmed");
            });
        });
        test("200: Responds with all bookings for service_id 2", () => {
          return request(app)
            .get("/api/bookings?service_id=2")
            .expect(200)
            .then((response) => {
              const bookings = response.body.bookings;
              expect(bookings[0].user_id).toBe(4);
              expect(bookings[0].status).toBe("cancelled");
            });
        });
        test("200: Responds with all bookings for user_id 3", () => {
          return request(app)
            .get("/api/bookings?user_id=3")
            .expect(200)
            .then((response) => {
              const bookings = response.body.bookings;
              expect(bookings[0].service_id).toBe(5);
              expect(bookings[0].status).toBe("confirmed");
            });
        });
        test("200: Responds with all bookings for booking_id 5", () => {
          return request(app)
            .get("/api/bookings?booking_id=5")
            .expect(200)
            .then((response) => {
              const bookings = response.body.bookings;
              expect(bookings[0].user_id).toBe(5);
              expect(bookings[0].service_id).toBe(4);
              expect(bookings[0].status).toBe("confirmed");
            });
        });
      });