const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection");
const seed = require('../db/seeds/seed');
const endpointsJson = require("../endpoints.json");
const {bookingsData, servicesData, usersData} = require("../db/data/test-data/index.js");
// const {convertTimestampToDate, createRef, formatComments} = require("../db/seeds/utils.js");

beforeEach(() => seed({bookingsData, servicesData, usersData}));
afterAll(() => db.end());