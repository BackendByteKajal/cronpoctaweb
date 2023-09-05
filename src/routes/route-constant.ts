export const AuthApiRoutes = {
  Login:"/login",
  AdminLogin:"/admin/login",
  Googlelogin:"/google",
  Callback:"/google/callback"
};

export const UserApiRoutes = {
  Register:"/register",
  Users:"/users",
  UserVerification:"/user/:id/verify",
  GetAllGuests:"/getallguests",
  UserVerified:"/userverified/:id"
   //UserVerification:"/home"
}

export const AdminApiRoutes = {
  MeetRoom:"/meetrooms/:id",
  EditRoom:"/editroom/:id",
  DeleteRoom:"/deleteroom/:id",
  FetchRoom:"/fetchroom/:id"
  
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
  EditBooking:"/editbookings/:id",
  DeleteBooking:"/deletebookings/:id",
  FETCHBOOKINGWITHID:"/fetchBookingWithId/:id",
  FETCHBOOKINGWITHUSERID:"/fetchbookingwithuserid"
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
