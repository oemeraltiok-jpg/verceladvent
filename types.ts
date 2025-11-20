export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface Joke {
  id: number;
  text: string;
}

export interface DoorStats {
    day: number;
    users: {
        id: string;
        firstName: string;
        lastName: string;
    }[];
}
