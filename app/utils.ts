import { Direction, Person } from "./types";

export const initPeople = (queues: number[][]) => {
  const people: Person[] = [];
  queues.forEach((queue, floorIndex) =>
    queue.forEach((destination, queueIndex) =>
      people.push({
        location: floorIndex,
        destination,
        direction: destination > floorIndex ? "up" : "down",
        queuePosition: queueIndex,
      })
    )
  );
  return people;
};

export const log = (
  direction: Direction,
  history: number[],
  people: Person[],
  finishedPeople: Person[]
) => {
  const lift = { direction, history: history.join(",") };
  console.table(
    [...people, ...finishedPeople].map((o) => ({
      ...o,
      lift: JSON.stringify(lift),
    }))
  );
};

export const inLift = (persons: Person[]) =>
  persons.filter((o) => o.location === "lift");
