export default interface habit {
  id: string;
  name: string;
  goal: number;
  days: number[];
  active: boolean;
}

export interface habitCheckIn {
  time: Date;
  goal: number;
  habitId: string;
  status: number;
  value: number;
}
