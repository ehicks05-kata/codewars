import { theLift } from "../index";
import { expect } from "chai";

describe("Example Tests", function () {
  // it("up", function () {
  //   var queues = [
  //     [], // G
  //     [], // 1
  //     [5, 5, 5], // 2
  //     [], // 3
  //     [], // 4
  //     [], // 5
  //     [], // 6
  //   ];
  //   var result = theLift(queues, 5);
  //   expect(result).to.have.members([0, 2, 5, 0]);
  // });

  it("down", function () {
    var queues = [
      [], // G
      [], // 1
      [1, 1], // 2
      [], // 3
      [], // 4
      [], // 5
      [], // 6
    ];
    var result = theLift(queues, 5);
    expect(result).to.have.members([0, 2, 1, 0]);
  });

  // it("up and up", function () {
  //   var queues = [
  //     [], // G
  //     [3], // 1
  //     [4], // 2
  //     [], // 3
  //     [5], // 4
  //     [], // 5
  //     [], // 6
  //   ];
  //   var result = theLift(queues, 5);
  //   expect(result).to.have.members([0, 1, 2, 3, 4, 5, 0]);
  // });

  // it("down and down", function () {
  //   var queues = [
  //     [], // G
  //     [0], // 1
  //     [], // 2
  //     [], // 3
  //     [2], // 4
  //     [3], // 5
  //     [], // 6
  //   ];
  //   var result = theLift(queues, 5);
  //   expect(result).to.have.members([0, 5, 4, 3, 2, 1, 0]);
  // });

  // it("yoyo", function () {
  //   var queues = [
  //     [], // G
  //     [], // 1
  //     [4, 4, 4, 4], // 2
  //     [], // 3
  //     [2, 2, 2, 2], // 4
  //     [], // 5
  //     [], // 6
  //   ];
  //   var result = theLift(queues, 2);
  //   expect(result).to.have.members([0, 2, 4, 2, 4, 2, 0]);
  // });
});
