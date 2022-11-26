import { Person, Direction, Location } from "./types";
import { inLift } from "./utils";

export const letPeopleIn = (
  people: Person[],
  capacity: number,
  floor: number,
  direction: Direction
): Person[] => {
  let remainingCapacity = capacity - inLift(people).length;
  if (remainingCapacity !== 0) {
    return people.map((o) => {
      if (o.location !== floor || o.direction !== direction) return o;

      if (remainingCapacity === 0) return o;
      remainingCapacity -= 1;

      return { ...o, location: "lift" };
    });
  }
  return people;
};

export const dropPeopleOff = (
  people: Person[],
  finishedPeople: Person[],
  floor: number
) => {
  const shouldBeDroppedOff = (o: Person) =>
    o.location === "lift" && o.destination === floor;
  finishedPeople.push(
    ...people
      .filter(shouldBeDroppedOff)
      .map((o) => ({ ...o, location: "destination" as Location }))
  );
  return people.filter((o) => !shouldBeDroppedOff(o));
};
