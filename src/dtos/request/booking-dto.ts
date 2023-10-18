export class BookingRoomDto {
    userId: number;
    meetRoomId: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    guests: string[];
    description:string;
    eventid:any;
    
  }

  export class BookingRoom {
    userId: number;
    meetRoomId: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    guests: string[];
    description: string;
    eventid: any;
    clstartTime: string;
    clendTime: string;
  }

  export class BookingRoomWithUserDto {
    userId: number;
    meetRoomId: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    guests: string[];
    description: string;
    userName:string;
    lastName:string;
  }