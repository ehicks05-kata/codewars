import { Person, Direction } from "./types";

const isOnTheWay = (floor: number, direction: Direction, destination: number) =>
  direction === "up" ? destination > floor : destination < floor;

export const getNextFloorInCurrentDirection = (
  people: Person[],
  floor: number,
  direction: Direction
) => {
  const peopleToDropOff = people
    .filter((o) => o.location === "lift")
    .filter((o) => isOnTheWay(floor, direction, o.destination));
  const nextDropOffFloor =
    peopleToDropOff.length === 0
      ? -1
      : direction === "up"
      ? Math.min(...peopleToDropOff.map((o) => o.destination))
      : Math.max(...peopleToDropOff.map((o) => o.destination));

  const peopleToPickUp = people
    .filter((o) => o.location !== "lift")
    .filter((o) => isOnTheWay(floor, direction, o.location as number))
    .filter((o) => isOnTheWay(floor, direction, o.destination))
    .filter((o) => o.direction === direction);

  const nextPickUpFloor =
    peopleToPickUp.length === 0
      ? -1
      : direction === "up"
      ? Math.min(...peopleToPickUp.map((o) => o.location as number))
      : Math.max(...peopleToPickUp.map((o) => o.location as number));

  if (nextDropOffFloor !== -1 || nextPickUpFloor !== -1) {
    const validFloors = [nextDropOffFloor, nextPickUpFloor].filter(
      (o) => o !== -1
    );
    const nextFloor =
      direction === "up" ? Math.min(...validFloors) : Math.max(...validFloors);
    return nextFloor;
  }
  return -1;
};
