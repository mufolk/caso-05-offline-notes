import { describe, expect, it } from "vitest";
import { check } from "../src/index.ts";

const notPlainObject = { ok: false, errors: ["not_plain_object"] };

describe("check", () => {
  it("accepts the official operation and stores each field as sent", () => {
    expect(
      check({
        op_id: "O1",
        note_id: "N",
        base_revision: 0,
        text: "start",
      }),
    ).toEqual({
      ok: true,
      operation: {
        op_id: "O1",
        note_id: "N",
        base_revision: 0,
        text: "start",
      },
    });
  });

  it("rejects a string, null, an empty array, a Date, and a class instance", () => {
    class Note {
      op_id = "O1";
      note_id = "N";
      base_revision = 0;
      text = "start";
    }

    expect(check("O1")).toEqual(notPlainObject);
    expect(check(null)).toEqual(notPlainObject);
    expect(check([])).toEqual(notPlainObject);
    expect(check(new Date())).toEqual(notPlainObject);
    expect(check(new Note())).toEqual(notPlainObject);
  });

  it("rejects an enumerable own key outside the closed set", () => {
    expect(
      check({
        op_id: "O1",
        note_id: "N",
        base_revision: 0,
        text: "start",
        author: "gui",
      }),
    ).toEqual({ ok: false, errors: ["extra_keys"] });

    const withSymbol = {
      op_id: "O1",
      note_id: "N",
      base_revision: 0,
      text: "start",
    };
    Object.defineProperty(withSymbol, Symbol("author"), {
      value: "gui",
      enumerable: true,
    });
    expect(check(withSymbol)).toEqual({ ok: false, errors: ["extra_keys"] });
  });

  it("names each missing or illegal field, with extra_keys in front", () => {
    expect(
      check({
        op_id: "   ",
        base_revision: "1",
        text: 1,
        author: "gui",
      }),
    ).toEqual({
      ok: false,
      errors: ["extra_keys", "op_id", "note_id", "base_revision", "text"],
    });
  });

  it("rejects null and undefined field values by the field name", () => {
    expect(
      check({
        op_id: "O1",
        note_id: null,
        base_revision: 0,
        text: "start",
      }),
    ).toEqual({ ok: false, errors: ["note_id"] });
    expect(
      check({
        op_id: "O1",
        note_id: undefined,
        base_revision: 0,
        text: "start",
      }),
    ).toEqual({ ok: false, errors: ["note_id"] });
  });

  it("rejects a whitespace-only id and stores a padded id as sent", () => {
    expect(
      check({
        op_id: "   ",
        note_id: "N",
        base_revision: 0,
        text: "start",
      }),
    ).toEqual({ ok: false, errors: ["op_id"] });

    expect(
      check({
        op_id: "O1",
        note_id: "  A  ",
        base_revision: 0,
        text: "  start  ",
      }),
    ).toEqual({
      ok: true,
      operation: {
        op_id: "O1",
        note_id: "  A  ",
        base_revision: 0,
        text: "  start  ",
      },
    });
  });

  it("accepts empty text", () => {
    expect(
      check({
        op_id: "O1",
        note_id: "N",
        base_revision: 0,
        text: "",
      }),
    ).toEqual({
      ok: true,
      operation: {
        op_id: "O1",
        note_id: "N",
        base_revision: 0,
        text: "",
      },
    });
  });

  it("rejects a base revision that is not an integer zero or greater", () => {
    const rejected = { ok: false, errors: ["base_revision"] };
    expect(
      check({ op_id: "O1", note_id: "N", base_revision: "1", text: "start" }),
    ).toEqual(rejected);
    expect(
      check({ op_id: "O1", note_id: "N", base_revision: -1, text: "start" }),
    ).toEqual(rejected);
    expect(
      check({ op_id: "O1", note_id: "N", base_revision: 1.5, text: "start" }),
    ).toEqual(rejected);
    expect(
      check({ op_id: "O1", note_id: "N", base_revision: 1n, text: "start" }),
    ).toEqual(rejected);
    expect(
      check({
        op_id: "O1",
        note_id: "N",
        base_revision: Number.NaN,
        text: "start",
      }),
    ).toEqual(rejected);
    expect(
      check({ op_id: "O1", note_id: "N", base_revision: null, text: "start" }),
    ).toEqual(rejected);
    expect(
      check({
        op_id: "O1",
        note_id: "N",
        base_revision: undefined,
        text: "start",
      }),
    ).toEqual(rejected);
  });

  it("accepts negative zero and stores it as sent", () => {
    const result = check({
      op_id: "O1",
      note_id: "N",
      base_revision: -0,
      text: "start",
    });
    expect(result).toEqual({
      ok: true,
      operation: {
        op_id: "O1",
        note_id: "N",
        base_revision: -0,
        text: "start",
      },
    });
    if (!result.ok) return;
    expect(Object.is(result.operation.base_revision, -0)).toBe(true);
  });

  it("rejects a custom prototype before looking at its keys", () => {
    expect(
      check(
        Object.assign(Object.create({ author: "gui" }), {
          op_id: "O1",
          note_id: "N",
          base_revision: 0,
          text: "start",
        }),
      ),
    ).toEqual(notPlainObject);
  });

  it("ignores a non-enumerable own key", () => {
    const hidden = {
      op_id: "O1",
      note_id: "N",
      base_revision: 0,
      text: "start",
    };
    Object.defineProperty(hidden, "author", {
      value: "gui",
      enumerable: false,
    });
    expect(check(hidden)).toEqual({
      ok: true,
      operation: {
        op_id: "O1",
        note_id: "N",
        base_revision: 0,
        text: "start",
      },
    });
  });

  it("accepts a payload whose prototype is null", () => {
    expect(
      check(
        Object.assign(Object.create(null), {
          op_id: "O1",
          note_id: "N",
          base_revision: 0,
          text: "start",
        }),
      ),
    ).toEqual({
      ok: true,
      operation: {
        op_id: "O1",
        note_id: "N",
        base_revision: 0,
        text: "start",
      },
    });
  });
});
