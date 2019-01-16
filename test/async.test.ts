import request from "supertest";

const api = request("http://localhost:8080");

describe("A basic async test:\n\t+", () => {
  test("Should return a 200", () => {
    return api.get("/validate").expect(200);
  });
});
