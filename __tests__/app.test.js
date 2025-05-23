jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnThis(),
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
}));

const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection");
const seed = require('../db/seeds/seed');
const firebaseAdmin = require('firebase-admin');
// const endpointsJson = require("../endpoints.json");
const {bookingsData, servicesData, usersData} = require("../db/data/test-data/index.js");
// const {convertTimestampToDate, createRef, formatComments} = require("../db/seeds/utils.js");

beforeEach(async () => {
  await seed({ usersData, bookingsData, servicesData });
});

afterAll(async () => {
  await db.end();
});

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
    test("return the new user", async () => {
      firebaseAdmin.auth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'userUID101',
          name: 'Tasos Pat',
          email: 'tasos@gmail.com'
        }),
      });
      const response = await request(app)
        .post("/api/users")
        .set('Authorization', 'Bearer fakeToken')
        .expect(201);
          expect(response.body.user).toMatchObject({
            firebase_uid: 'userUID101',
          name: 'Tasos Pat',
          email: 'tasos@gmail.com',
          phone_no: null,
          role: 'user'
          });
        
    });
    test('400: Missing email in token causes bad request', async () => {
      firebaseAdmin.auth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'uid123',
          name: 'Test User'
        }),
      });
    
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer fakeToken')
        .expect(400);
      expect(response.body.msg).toBe("Bad Request");
    });
    test('409: User already exists (duplicate email or uid)', async () => {
      // Assuming user with this email already exists in test data
      firebaseAdmin.auth.mockReturnValue({
        verifyIdToken: jest.fn().mockResolvedValue({
          uid: 'userUID123',
          name: 'Alice Duplicate',
          email: 'alice@example.com'
        })
      });
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer fakeToken')
        .expect(409);
      
      expect(response.body.msg).toBe('User already exists');
    });
    })

    describe("GET /api/users/:user_id", () => {
        test("200: Responds with a single user when an admin makes the request", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'userUID123',
              name: 'Alice Johnson',
              email: 'alice@example.com'
            })
          });
          const response = await request(app)
            .get("/api/users/1")
            .set('Authorization', 'Bearer fakeToken')
            .expect(200);
           
              const user = response.body.user;
              expect(user.name).toBe('Alice Johnson');
              expect(user.email).toBe('alice@example.com');
              expect(user.phone_no).toBe('123-456-7890');
        });
        test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'adminUID123',
              name: 'Diana Prince',
              email: 'diana@example.com'
            })
          });
          const response = await request(app)
            .get('/api/users/999')
            .set('Authorization', 'Bearer fakeToken')
            .expect(404);
              expect(response.body.msg).toBe('No user found for user_id: 999');
        });
        test('GET:400 sends an appropriate status and error message when given an invalid id', async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'adminUID123',
              name: 'Diana Prince',
              email: 'diana@example.com'
            })
          });
          const response = await request(app)
            .get('/api/users/not-a-user')
            .set('Authorization', 'Bearer fakeToken')
            .expect(400);
    
              expect(response.body.msg).toBe('Bad Request');
        });
      });

      describe("GET /api/bookings", () => {
        test("200: Responds with all bookings when an admin is logged in", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'adminUID123',
              name: 'Diana Prince',
              email: 'diana@example.com'
            })
          });
          const response = await request(app)
            .get("/api/bookings")
            .set('Authorization', 'Bearer fakeToken')
            .expect(200);
  
              const bookings = response.body.bookings;
              expect(bookings[0].user_id).toBe(1);
              expect(bookings[0].service_id).toBe(1);
              expect(bookings[0].status).toBe("confirmed");
        });
        test("200: Responds with all bookings for service_id 5 when the user who made the booking is logged in", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'userUID789',
              name: 'Charlie Brown',
              email: 'charlie@example.com'
            })
          });
          const response = await request(app)
            .get("/api/bookings?service_id=5")
            .set('Authorization', 'Bearer fakeToken')
            .expect(200);

            const bookings = response.body.bookings;
              expect(bookings[0].user_id).toBe(3);
              expect(bookings[0].service_id).toBe(5);
              expect(bookings[0].status).toBe("confirmed");
        });
        test("200: Responds with all bookings for service_id 5 when an admin is logged in", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'adminUID123',
              name: 'Diana Prince',
              email: 'diana@example.com'
            })
          });
          const response = await request(app)
            .get("/api/bookings?service_id=5")
            .set('Authorization', 'Bearer fakeToken')
            .expect(200);

            const bookings = response.body.bookings;
              expect(bookings[0].user_id).toBe(3);
              expect(bookings[0].service_id).toBe(5);
              expect(bookings[0].status).toBe("confirmed");
        });
        test("200: Responds with all bookings for user_id 3 when the user who made the booking is logged in", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'userUID789',
              name: 'Charlie Brown',
              email: 'charlie@example.com'
            })
          });
          const response = await request(app)
            .get("/api/bookings?user_id=3")
            .set('Authorization', 'Bearer fakeToken')
            .expect(200)
              const bookings = response.body.bookings;
              expect(bookings[0].service_id).toBe(5);
              expect(bookings[0].status).toBe("confirmed");
        });
        test("200: Responds with the booking with booking_id 2 when the user who made the booking is logged in", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'userUID456',
              name: 'Bob Smith',
              email: 'bob@example.com'
            })
          });
          const response = await request(app)
            .get("/api/bookings?booking_id=2")
            .set('Authorization', 'Bearer fakeToken')
            .expect(200);
        
              const bookings = response.body.bookings;
              expect(bookings[0].user_id).toBe(2);
              expect(bookings[0].service_id).toBe(3);
              expect(bookings[0].status).toBe("pending");
        });
        test("200: Responds with the bookings of user 1 with service_id 1 when the user who made the bookings is logged in", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'userUID123',
              name: 'Alice Johnson',
              email: 'alice@example.com'
            })
          });
          const response = await request(app)
            .get("/api/bookings?user_id=1&service_id=1")
            .set('Authorization', 'Bearer fakeToken')
            .expect(200);
        
              const bookings = response.body.bookings;
              expect(bookings[0].user_id).toBe(1);
              expect(bookings[0].service_id).toBe(1);
              expect(bookings[0].status).toBe("confirmed");
              expect(bookings).toEqual([
                expect.objectContaining({
                  user_id: 1,
                service_id: 1,
                status: 'confirmed'
                }),
                expect.objectContaining({
                  user_id: 1,
                service_id: 1,
                status: 'pending'
                }) 
            ])
        });
      });
      describe("POST /api/bookings", () => {
        test("return the new booking", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'userUID456',
              name: 'Bob Smith',
              email: 'bob@example.com'
            })
          });
            const bookingObj = {
                user_id: 2,
                service_id: 1,
                booking_time: '2025-04-24 14:00:00'
              };
              const expected = new Date(bookingObj.booking_time).toISOString();
          const response = await request(app)
            .post("/api/bookings")
            .send(bookingObj)
            .set('Authorization', 'Bearer fakeToken')
            .expect(201);
           
              const received = new Date(response.body.booking.booking_time).toISOString();
              expect(response.body.booking.user_id).toBe(2);
              expect(response.body.booking.service_id).toBe(1);
              expect(received).toBe(expected);
        });
        test("POST 400: Responds with an appropriate status and error message when provided with no service_id", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'adminUID123',
              name: 'Diana Prince',
              email: 'diana@example.com'
            })
          });
          const response = await request(app)
            .post("/api/bookings")
            .send({
              user_id: 5,
              booking_time: '2025-04-24 14:00:00'
            })
            .set('Authorization', 'Bearer fakeToken')
            .expect(400);
            
              expect(response.body.msg).toBe("Bad Request");
        });
        test("POST 400: Responds with an appropriate status and error message when provided with no user_id", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'adminUID123',
              name: 'Diana Prince',
              email: 'diana@example.com'
            })
          });
          const response = await request(app)
            .post("/api/bookings")
            .send({
              service_id: 1,
              booking_time: '2025-04-24 14:00:00'
            })
            .set('Authorization', 'Bearer fakeToken')
            .expect(400);
            
              expect(response.body.msg).toBe("Bad Request");
        });
        test("POST 400: Responds with an appropriate status and error message when provided with no booking time", async () => {
          firebaseAdmin.auth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({
              uid: 'adminUID123',
              name: 'Diana Prince',
              email: 'diana@example.com'
            })
          });
          const response = await request(app)
            .post("/api/bookings")
            .send({
              user_id: 5,
              service_id: 1 
            })
            .set('Authorization', 'Bearer fakeToken')
            .expect(400);
            
              expect(response.body.msg).toBe("Bad Request");
        });
        })
        describe("DELETE /api/users/:user_id", () => {
          test('204: gets an empty object for a deleted user', () => {
            return request(app)
              .delete("/api/users/1")
              .expect(204)
              .then((res) => {
                expect(res.body).toEqual({});
              })                      
          });
          test("DELETE 404: Responds with an appropriate status and error message when provided with a user_id that doesn't exist", () => {
            return request(app)
              .delete("/api/users/7")
              .expect(404)
              .then((res) => {
                expect(res.body.msg).toBe('User with ID "7" is not found')
              })
          });
          test("DELETE 400: Responds with an appropriate status and error message when provided with an invalid user_id", () => {
            return request(app)
              .delete("/api/users/not-an-id")
              .expect(400)
              .then((res) => {
                expect(res.body.msg).toBe('Bad Request')
              })
          });
          })
          describe("DELETE /api/bookings/:booking_id", () => {
            test('204: gets an empty object for a deleted booking', () => {
              return request(app)
                .delete("/api/bookings/1")
                .expect(204)
                .then((res) => {
                  expect(res.body).toEqual({});
                })                      
            });
            test("DELETE 404: Responds with an appropriate status and error message when provided with a booking_id that doesn't exist", () => {
              return request(app)
                .delete("/api/bookings/7")
                .expect(404)
                .then((res) => {
                  expect(res.body.msg).toBe('Booking with ID "7" is not found')
                })
            });
            test("DELETE 400: Responds with an appropriate status and error message when provided with an invalid booking_id", () => {
              return request(app)
                .delete("/api/bookings/not-an-id")
                .expect(400)
                .then((res) => {
                  expect(res.body.msg).toBe('Bad Request')
                })
            });
            })
          describe("GET /api/users",() => {
              test("200: Responds with all users", async () => {
                firebaseAdmin.auth.mockReturnValue({
                  verifyIdToken: jest.fn().mockResolvedValue({
                    uid: 'adminUID123',
                    full_name: 'Diana Prince',
                    email: 'diana@example.com',
                  }),
                });
                const response = await request(app)
                .get('/api/users')
                .set('Authorization', 'Bearer fakeToken')
                .expect(200)
            
                  expect(response.body.users).toBeInstanceOf(Array);
                  expect(response.body.users.length).toBeGreaterThan(0);
                  response.body.users.forEach((user) => {
                    expect(user).toMatchObject({
                      name: expect.any(String),
                      email: expect.any(String),
                      phone_no: expect.any(String),
                    });
                  });
              });
              test("403: Responds with forbidden if a regular user", async () => {
                firebaseAdmin.auth.mockReturnValue({
                  verifyIdToken: jest.fn().mockResolvedValue({
                    uid: 'userUID123',
                    full_name: 'Alice Johnson',
                    email: 'alice@example.com',
                  }),
                });
                const response = await request(app)
                .get('/api/users')
                .set('Authorization', 'Bearer fakeToken')
                .expect(403)
            
                  expect(response.body.msg).toBe("Forbidden");
              });
              test('401: no token provided', async () => {
                const response = await request(app).get('/api/users').expect(401);
                expect(response.body.msg).toBe('No token provided');
              });
            });
            describe("POST /api/services", () => {
              test("return the new service", () => {
                  const serviceObj = {
                      name: "Body Painting",
                      duration: 60,
                      price: "60.00",
                      description: "A full body painting design"
                    };
                return request(app)
                  .post("/api/services")
                  .send(serviceObj)
                  .expect(201)
                  .then((res) => {
                    expect(res.body.service).toMatchObject(serviceObj);
                  });
              });
              test("POST 400: Responds with an appropriate status and error message when provided with no name", () => {
                return request(app)
                  .post("/api/services")
                  .send({
                    duration: 60,
                    price: "60.00",
                    description: "A full body painting design"
                  })
                  .expect(400)
                  .then((res) => {
                    expect(res.body.msg).toBe("Bad Request");
                  });
              });
              test("POST 400: Responds with an appropriate status and error message when provided with no duration", () => {
                return request(app)
                  .post("/api/services")
                  .send({
                    name: "Body Painting",
                    price: "60.00",
                    description: "A full body painting design"
                  })
                  .expect(400)
                  .then((res) => {
                    expect(res.body.msg).toBe("Bad Request");
                  });
              });
              test("POST 400: Responds with an appropriate status and error message when provided with no price", () => {
                return request(app)
                  .post("/api/services")
                  .send({
                    name: "Body Painting",
                    duration: 60,
                    description: "A full body painting design"
                  })
                  .expect(400)
                  .then((res) => {
                    expect(res.body.msg).toBe("Bad Request");
                  });
              });
              })
              describe("DELETE /api/services/:service_id", () => {
                test('204: gets an empty object for a deleted service', () => {
                  return request(app)
                    .delete("/api/services/1")
                    .expect(204)
                    .then((res) => {
                      expect(res.body).toEqual({});
                    })                      
                });
                test("DELETE 404: Responds with an appropriate status and error message when provided with a service_id that doesn't exist", () => {
                  return request(app)
                    .delete("/api/services/7")
                    .expect(404)
                    .then((res) => {
                      expect(res.body.msg).toBe('Service with ID "7" is not found')
                    })
                });
                test("DELETE 400: Responds with an appropriate status and error message when provided with an invalid service_id", () => {
                  return request(app)
                    .delete("/api/services/not-an-id")
                    .expect(400)
                    .then((res) => {
                      expect(res.body.msg).toBe('Bad Request')
                    })
                });
                })
                describe("/api/bookings/:booking_id", () => {
                  test("PATCH: 200 return the updated booking", () => {
                    return request(app)
                    .patch("/api/bookings/1")
                    .send({
                      service_id: 2,
                      booking_time: '2025-04-10 15:00:00'
                    })
                    .expect(200)
                    .then((res) => {
                      const booking = res.body.booking;
                      expect(booking.user_id).toBe(1);
                      expect(booking.service_id).toBe(2);
                      expect(booking.booking_time).toBe(new Date('2025-04-10 15:00:00').toISOString());
                      expect(booking.status).toBe('pending');  
                    });
                  })
                  test('PATCH:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
                    return request(app)
                      .patch('/api/bookings/999')
                      .send({
                        service_id: 2,
                        booking_time: '2025-04-10 15:00:00'
                      })
                      .expect(404)
                      .then((response) => {
                        expect(response.body.msg).toBe('No booking found for booking_id: 999');
                      });
                  });
                  test('PATCH:400 sends an appropriate status and error message when given an invalid id', () => {
                    return request(app)
                      .patch('/api/bookings/not-a-booking')
                      .send({
                        service_id: 2,
                        booking_time: '2025-04-10 15:00:00'
                      })
                      .expect(400)
                      .then((response) => {
                        expect(response.body.msg).toBe('Bad Request');
                      });
                  });
                })
                describe("/api/users/:user_id", () => {
                  test("PATCH: 200 return the updated user", () => {
                    return request(app)
                    .patch("/api/users/1")
                    .send({
                      email: 'alice123@example.com',
                      phone_no: '123-456-7880'
                    })
                    .expect(200)
                    .then((res) => {
                      const user = res.body.user;
                      expect(user.name).toBe('Alice Johnson');
                      expect(user.email).toBe('alice123@example.com');
                      expect(user.phone_no).toBe('123-456-7880');
                    });
                  })
                  test('PATCH:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
                    return request(app)
                      .patch('/api/users/999')
                      .send({
                        email: 'alice123@example.com',
                        phone_no: '123-456-7880'
                      })
                      .expect(404)
                      .then((response) => {
                        expect(response.body.msg).toBe('No user found for user_id: 999');
                      });
                  });
                  test('PATCH:400 sends an appropriate status and error message when given an invalid id', () => {
                    return request(app)
                      .patch('/api/users/not-a-user')
                      .send({
                        email: 'alice123@example.com',
                        phone_no: '123-456-7880'
                      })
                      .expect(400)
                      .then((response) => {
                        expect(response.body.msg).toBe('Bad Request');
                      });
                  });
                })
                describe("/api/services/:service_id", () => {
                  test("PATCH: 200 return the updated service", () => {
                    return request(app)
                    .patch("/api/services/1")
                    .send({
                      duration: 75,
                      price: 60
                    })
                    .expect(200)
                    .then((res) => {
                      const service = res.body.service;
                      expect(service.name).toBe('Full Face Painting');
                      expect(service.duration).toBe(75);
                      expect(service.price).toBe("60.00");
                      expect(service.description).toBe('Complete artistic face painting for events and parties.');
                    });
                  })
                  test('PATCH:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
                    return request(app)
                      .patch('/api/services/999')
                      .send({
                        duration: 75,
                        price: 60
                      })
                      .expect(404)
                      .then((response) => {
                        expect(response.body.msg).toBe('No service found for service_id: 999');
                      });
                  });
                  test('PATCH:400 sends an appropriate status and error message when given an invalid id', () => {
                    return request(app)
                      .patch('/api/services/not-a-service')
                      .send({
                        duration: 75,
                        price: 60
                      })
                      .expect(400)
                      .then((response) => {
                        expect(response.body.msg).toBe('Bad Request');
                      });
                  });
                })