import {
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  getSides,
} from "./main.ts"; // Assuming main.ts is in the same directory

Deno.test("getSides should correctly merge consecutive horizontal edges", () => {
  const edges = [
    "1-2,1",
    "2-3,1",
    "3-4,1",
  ];
  const expected = [
    "1-4,1",
  ];
  assertEquals(getSides(edges), expected);
});

Deno.test("getSides should correctly merge consecutive vertical edges", () => {
  const edges = [
    "1,1-2",
    "1,2-3",
    "1,3-4",
  ];
  const expected = [
    "1,1-4",
  ];
  assertEquals(getSides(edges), expected);
});

Deno.test("getSides should handle mixed horizontal and vertical edges", () => {
  const edges = [
    "1-2,1",
    "2-3,1",
    "1,1-2",
    "1,2-3",
  ];
  const expected = [
    "1,1-3",
    "1-3,1",
  ];
  assertEquals(getSides(edges).sort(), expected.sort());
});

Deno.test("getSides should handle non-consecutive edges", () => {
  const edges = [
    "1-2,1",
    "3-4,1",
    "1,1-2",
    "1,3-4",
  ];
  const expected = [
    "1,1-2",
    "1,3-4",
    "1-2,1",
    "3-4,1",
  ];
  assertEquals(getSides(edges).sort(), expected.sort());
});

Deno.test("getSides should handle empty input", () => {
  const edges: string[] = [];
  const expected: string[] = [];
  assertEquals(getSides(edges), expected);
});
