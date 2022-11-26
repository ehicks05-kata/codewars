export type Direction = "up" | "down";
export type Location = number | "lift" | "destination";

export interface Person {
  destination: number;
  direction: Direction;
  location: Location;
  queuePosition?: number;
}

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

export const theLift = (queues: number[][], capacity: number): number[] => {
  let people = initPeople(queues);
  const finishedPeople: Person[] = [];
  let direction: Direction = "up";
  const history = [0];

  console.log(`capacity is ${capacity}`);

  let i = 0;
  while (people.length !== 0) {
    console.log("start of round " + i++);
    log(direction, history, people, finishedPeople);

    const floor = history[history.length - 1];

    // 1. HANDLE FLOOR STOP
    people = dropPeopleOff(people, finishedPeople, floor);
    people = letPeopleIn(people, capacity, floor, direction);

    // 2. DETERMINE NEXT ACTION

    // PRIORITY 0: WHO CAN WE SERVICE WITHOUT CHANGING DIRECTION?
    // find closest floor in our direction that someone wants to leave to, or join from.
    const nextFloor = getNextFloorInCurrentDirection(people, floor, direction);
    if (nextFloor !== -1) {
      console.log("NEXT FLOOR method 1");
      history.push(nextFloor);
      log(direction, history, people, finishedPeople);
      continue;
    }

    // PRIORITY 1: WE'VE EXHAUSTED FOLKS IN OUR PATH GOING OUR DIRECTION

    // if empty: if up, go to highest person going down, else go to lowest person going up
    if (inLift(people).length === 0) {
      const nextFloor: number | undefined =
        direction === "up"
          ? people
              .filter((o) => o.location !== "lift")
              .filter((o) => o.direction === "down")
              .sort(
                (o1, o2) => (o2.location as number) - (o1.location as number)
              )
              .map((o) => o.location as number)[0]
          : people
              .filter((o) => o.location !== "lift")
              .filter((o) => o.direction === "up")
              .sort(
                (o1, o2) => (o1.location as number) - (o2.location as number)
              )
              .map((o) => o.location as number)[0];

      if (nextFloor === floor) {
        console.log("NEXT FLOOR method 2a");
        // change direction
        direction = direction === "up" ? "down" : "up";

        // let folks on
        people = letPeopleIn(people, capacity, floor, direction);

        // determine next floor with method 1
        const nextFloor = getNextFloorInCurrentDirection(
          people,
          floor,
          direction
        );
        history.push(nextFloor);
        log(direction, history, people, finishedPeople);
        continue;
      }

      if (nextFloor || nextFloor === 0) {
        console.log("NEXT FLOOR method 2");
        direction = direction === "up" ? "down" : "up";

        // if we've changed direction, new folks may want on
        // people = letPeopleIn(people, capacity, floor, direction);

        history.push(nextFloor);
        log(direction, history, people, finishedPeople);
        continue;
      }
    }

    // change direction and proceed as normal
    direction = direction === "up" ? "down" : "up";
    // if we've changed direction, new folks may want on
    people = letPeopleIn(people, capacity, floor, direction);

    const nextFloor2 = getNextFloorInCurrentDirection(people, floor, direction);
    if (nextFloor !== -1) {
      console.log("NEXT FLOOR method 3");
      history.push(nextFloor2);
      log(direction, history, people, finishedPeople);
      continue;
    }
  }

  if (history[history.length - 1] !== 0) history.push(0);
  return history;
};
