import { dropPeopleOff, letPeopleIn } from "./app/at_rest_behaviors";
import { getNextFloorInCurrentDirection } from "./app/navigation";
import { Person, Direction } from "./app/types";
import { initPeople, inLift, log } from "./app/utils";

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
  console.log({ queues, capacity, history: history.join(", ") });
  return history;
};
