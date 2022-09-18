import { afterAll, beforeAll } from "vitest";

const ogLog = console.log;

beforeAll(() => {
  console.log = () => {};
});

afterAll(() => {
  console.log = ogLog;
});
