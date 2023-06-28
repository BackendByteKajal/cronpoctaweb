export const AuthApiRoutes = {
  Login:"/login",
  AdminLogin:"/admin/login"
};

export const UserApiRoutes = {
  Register:"/register",
  Users:"/users",
  UserVerification:"/user/:id/verify"
  // UserVerification:"/home"
}

export const AdminApiRoutes = {
  MeetRoom:"/meetrooms/:id"
}

export const PingApiRoute = {
  Ping: "/ping"
}

export const MeetingRoomApiRoute = {
  MeetRoom: "/meetrooms",
}

export const BookingApiRoute = {
  BookMeetRoom: "/bookroom",
  Bookings:"/bookings",
  MyBookings:"/mybookings",
  EditBooking:"/bookings/:id",
  DeleteBooking:"/bookings/:id"
}

export const RouteVersion = {
  V1: '/v1',
  V2: '/v2'
};

export const ApiMethod = {
  Post: 'POST',
  Get: 'GET',
  Put: 'PUT',
  Delete: 'DELETE',
};
