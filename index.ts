type Direction = "up" | "down";
type Location = number | "lift" | "destination";

interface Person {
  destination: number;
  direction: Direction;
  location: Location;
  queuePosition?: number;
}

const initPeople = (queues: number[][]) => {
  const people: Person[] = [];
  queues.forEach((queue, floorIndex) =>
    queue.forEach((destination, queueIndex) =>
      people.push({
        destination,
        direction: destination > floorIndex ? "up" : "down",
        location: floorIndex,
        queuePosition: queueIndex,
      })
    )
  );
  return people;
};

const inLift = (persons: Person[]) =>
  persons.filter((o) => o.location === "lift");

const getNextFloorInCurrentDirection = (
  people: Person[],
  floor: number,
  direction: Direction
) => {
  const peopleToDropOff = people
    .filter((o) => o.location === "lift")
    .filter((o) =>
      direction === "up" ? o.destination > floor : o.destination < floor
    );
  const nextDropOffFloor =
    peopleToDropOff.length === 0
      ? -1
      : direction === "up"
      ? Math.min(...peopleToDropOff.map((o) => o.destination))
      : Math.max(...peopleToDropOff.map((o) => o.destination));

  const peopleToPickUp = people
    .filter((o) => o.location !== "lift" && o.location !== "destination")
    .filter((o) =>
      direction === "up" ? o.location > floor : o.location < floor
    )
    .filter((o) => o.direction === direction)
    .filter((o) =>
      direction === "up" ? o.destination > floor : o.destination < floor
    );
  const nextPickUpFloor =
    peopleToPickUp.length === 0
      ? -1
      : direction === "up"
      ? Math.min(...peopleToPickUp.map((o) => o.location as number))
      : Math.max(...peopleToPickUp.map((o) => o.location as number));

  console.table([
    {
      peopleToDropOff,
      nextDropOffFloor,
      peopleToPickUp,
      nextPickUpFloor,
    },
  ]);

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

const letPeopleIn = (
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

export const theLift = (queues: number[][], capacity: number): number[] => {
  let people = initPeople(queues);

  const finishedPeople: Person[] = [];

  let direction: Direction = "up";
  const history = [0];

  let i = 0;
  while (people.length !== 0) {
    // if (i > 5) break;

    console.log("Starting round " + i++);
    console.table([{ direction, history: history.join(","), capacity }]);
    console.table([...people, ...finishedPeople]);
    const floor = history[history.length - 1];

    // 1. HANDLE FLOOR STOP

    // 1a. let people off
    const shouldBeDroppedOff = (o: Person) =>
      o.location === "lift" && o.destination === floor;
    finishedPeople.push(
      ...people
        .filter(shouldBeDroppedOff)
        .map((o) => ({ ...o, location: "destination" as "destination" }))
    );
    people = people.filter((o) => !shouldBeDroppedOff(o));

    // 1b. let people on
    people = letPeopleIn(people, capacity, floor, direction);

    // 2. DETERMINE NEXT ACTION

    // PRIORITY 0: WHO CAN WE SERVICE WITHOUT CHANGING DIRECTION?
    // find closest floor in our direction that someone wants to leave to, or join from.
    const nextFloor = getNextFloorInCurrentDirection(people, floor, direction);
    if (nextFloor !== -1) {
      history.push(nextFloor);
      continue;
    }

    // PRIORITY 1: WE'VE EXHAUSTED THIS DIRECTION AND MUST TURN AROUND
    // 1a: IF EMPTY - FIND HIGHEST/LOWEST FLOOR W/ SOMEONE GOING OTHER DIRECTION?
    // 1b: business as usual

    direction = direction === "up" ? "down" : "up";
    // now that we've changed direction, new folks may want on
    people = letPeopleIn(people, capacity, floor, direction);

    if (inLift(people).length > 0) {
      const nextFloor = getNextFloorInCurrentDirection(
        people,
        floor,
        direction
      );
      if (nextFloor !== -1) {
        history.push(nextFloor);
        continue;
      }
    } else {
      const candidates = people
        .filter((o) => o.location !== "lift" && o.location !== "destination")
        .filter((o) =>
          direction === "up"
            ? o.location > floor && o.direction === "down"
            : o.location < floor && o.direction === "up"
        );

      console.log({ candidates });

      if (candidates.length > 0) {
        const nextFloor =
          direction === "up"
            ? Math.max(...candidates.map((o) => o.location as number))
            : Math.min(...candidates.map((o) => o.location as number));
        console.log("using candidates to determine next floor");
        history.push(nextFloor);
        continue;
      }
    }

    console.log("all done here?");
    break;
  }

  if (history[history.length - 1] !== 0) history.push(0);
  return history;
};
