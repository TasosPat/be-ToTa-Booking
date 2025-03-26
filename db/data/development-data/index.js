module.exports = {
    usersData: [
      { name: 'John Doe', email: 'john@example.com', phone_no: '1234567890' },
      { name: 'Jane Smith', email: 'jane@example.com', phone_no: '0987654321' },
    ],
    servicesData: [
      { name: 'Haircut', duration: 30, price: 25.00, description: 'A nice haircut.' },
      { name: 'Massage', duration: 60, price: 50.00, description: 'A relaxing massage.' },
    ],
    bookingsData: [
      { user_id: 1, service_id: 1, booking_time: '2025-03-27 10:00:00', status: 'pending' },
      { user_id: 2, service_id: 2, booking_time: '2025-03-27 14:00:00', status: 'confirmed' },
    ],
  };
  