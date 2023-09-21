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