export type Direction = "up" | "down";
export type Location = number | "lift" | "destination";

export interface Person {
  destination: number;
  direction: Direction;
  location: Location;
  queuePosition?: number;
}
