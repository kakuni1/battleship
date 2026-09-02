import { describe, expect, it } from "vitest";
import { Deck } from "./cpu.js";

describe("Deck", () => {
  it("standard (100) length deck", () => {
    expect(new Deck().size).toBe(100);
  });

  it("one move, (99) length deck", () => {
    const cpu = new Deck();
    cpu.next();
    expect(cpu.size).toBe(99);
  });

  it("drained deck, (0) length deck", () => {
    const cpu = new Deck();
    while (!cpu.isEmpty) cpu.next();
    expect(cpu.size).toBe(0);
  });

  it("drained deck, (0) length deck, isEmpty true", () => {
    const cpu = new Deck();
    while (!cpu.isEmpty) cpu.next();
    expect(cpu.isEmpty).toBe(true);
  });

  it("drained deck + extra move, throws error", () => {
    const cpu = new Deck();
    while (!cpu.isEmpty) cpu.next();
    expect(() => cpu.next()).toThrow("cpu, out of moves");
  });

  it("drained deck, all unique moves", () => {
    const cpu = new Deck();
    const seen = new Set();
    while (!cpu.isEmpty) seen.add(cpu.next());
    expect(seen).toEqual(new Set(Array.from({ length: 100 }, (_, i) => i)));
  });

  it("custom deck size, (5)", () => {
    const cpu = new Deck(5);
    const seen = new Set();
    while (!cpu.isEmpty) seen.add(cpu.next());
    expect(seen).toEqual(new Set([0, 1, 2, 3, 4]));
  });

  it("hit, queue adjacent cells", () => {
    const cpu = new Deck();
    cpu.recordAttack(43, { result: "hit" });
    const moves = [cpu.next(), cpu.next(), cpu.next(), cpu.next()];
    expect(new Set(moves)).toEqual(new Set([33, 42, 44, 53]));
  });

  it("hit, top-left corner, queue two valid cells only", () => {
    const cpu = new Deck();
    cpu.recordAttack(0, { result: "hit" });
    const moves = [cpu.next(), cpu.next()];
    expect(new Set(moves)).toEqual(new Set([1, 10]));
  });

  it("miss & hit, queue on hit only", () => {
    const cpu = new Deck(2);
    const one = cpu.next();
    cpu.recordAttack(one, { result: "miss" });
    const two = cpu.next();
    expect(two).not.toBe(one);
    expect(cpu.isEmpty).toBe(true);
  });

  it("hit, same cell twice, dont requeue", () => {
    const cpu = new Deck();
    cpu.recordAttack(43, { result: "miss" });
    cpu.recordAttack(43, { result: "miss" });
    const moves = [cpu.next(), cpu.next(), cpu.next(), cpu.next()];
    expect(new Set(moves).size).toBe(4);
  });
});
