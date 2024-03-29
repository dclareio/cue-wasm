const CUE = require('../dist/cue-wasm-index.cjs');

const cueString1 = `
test: string
test: "test"
`;

const cueString2 = `
hello: string
hello: "world"
`;

["full"].forEach(variant => {
  test(`parses cue to js object - ${variant}`, async () => {
    const cue = await CUE.init(variant);
    const result = cue.parse(cueString1);
    expect(result).toEqual({ test: "test" });
  });

  test(`parses cue tagged template to js object - ${variant}`, async () => {
    const cue = await CUE.init(variant);
    const result = cue`
      tagged: "template"
    `;
    expect(result).toEqual({ tagged: "template" });
  });

  test(`parses cue tagged with int interpolation to js object - ${variant}`, async () => {
    const cue = await CUE.init(variant);
    const result = cue`
      tagged: int
      tagged: ${1}
    `;
    expect(result).toEqual({ tagged: 1 });
  });

  test(`parses cue tagged with string interpolation to js object - ${variant}`, async () => {
    const cue = await CUE.init(variant);
    const result = cue`
      tagged: string
      tagged: "${"test"}"
    `;
    expect(result).toEqual({ tagged: "test" });
  });

  test(`parses cue tagged with obj interpolation to js object - ${variant}`, async () => {
    const cue = await CUE.init(variant);
    const result = cue`
      tagged: string
      ${{tagged: "test"}}
    `;
    expect(result).toEqual({ tagged: "test" });
  });

  test(`parses list of cue strings to js object - ${variant}`, async () => {
    const cue = await CUE.init(variant);
    const result = cue.parse([cueString1, cueString2]);
    expect(result).toEqual({ test: "test", hello: "world" });
  });

  // Perf tests
  // https://github.com/cue-lang/cue/wiki/Creating-test-or-performance-reproducers
  // TODO: provide slim/full bundles, this doesn't pass with tinygo
  test(`parses cue golden file - ${variant}`, async () => {
    const cue = await CUE.init(variant);
    const result = cue`
    #A: {
      a: string
      // when using tinygo, breaks with: *a | string
    }

    s: [Name=string]: #A & {
        a: Name
    }

    s: bar: _

    foo: [
        for _, a in s if a.a != _|_ {a},
    ]
    `;

    expect(result).toEqual({ s: { bar: { a: 'bar' } }, foo: [ { a: 'bar' } ] });
  });

  test(`parses cue to ast - ${variant}`, async () => {
    const cue = await CUE.init(variant);
    const result = cue.ast`
    #A: {
      a: string
      // when using tinygo, breaks with: *a | string
    }

    s: [Name=string]: #A & {
        a: Name
    }

    s: bar: _

    foo: [
        for _, a in s if a.a != _|_ {a},
    ]
    `;
    expect(result).toEqual({
      "Decls": [
        {
          "Attrs": [],
          "Label": {
            "Name": "#A",
            "NamePos": {}
          },
          "Optional": {},
          "Token": 47,
          "TokenPos": {},
          "Value": {
            "Elts": [
              {
                "Attrs": [],
                "Label": {
                  "Name": "a",
                  "NamePos": {}
                },
                "Optional": {},
                "Token": 47,
                "TokenPos": {},
                "Value": {
                  "Name": "string",
                  "NamePos": {}
                }
              }
            ],
            "Lbrace": {},
            "Rbrace": {}
          }
        },
        {
          "Attrs": [],
          "Label": {
            "Name": "s",
            "NamePos": {}
          },
          "Optional": {},
          "Token": 47,
          "TokenPos": {},
          "Value": {
            "Elts": [
              {
                "Attrs": [],
                "Label": {
                  "Elts": [
                    {
                      "Equal": {},
                      "Expr": {
                        "Name": "string",
                        "NamePos": {}
                      },
                      "Ident": {
                        "Name": "Name",
                        "NamePos": {}
                      }
                    }
                  ],
                  "Lbrack": {},
                  "Rbrack": {}
                },
                "Optional": {},
                "Token": 47,
                "TokenPos": {},
                "Value": {
                  "Op": 22,
                  "OpPos": {},
                  "X": {
                    "Name": "#A",
                    "NamePos": {}
                  },
                  "Y": {
                    "Elts": [
                      {
                        "Attrs": [],
                        "Label": {
                          "Name": "a",
                          "NamePos": {}
                        },
                        "Optional": {},
                        "Token": 47,
                        "TokenPos": {},
                        "Value": {
                          "Name": "Name",
                          "NamePos": {}
                        }
                      }
                    ],
                    "Lbrace": {},
                    "Rbrace": {}
                  }
                }
              }
            ],
            "Lbrace": {},
            "Rbrace": {}
          }
        },
        {
          "Attrs": [],
          "Label": {
            "Name": "s",
            "NamePos": {}
          },
          "Optional": {},
          "Token": 47,
          "TokenPos": {},
          "Value": {
            "Elts": [
              {
                "Attrs": [],
                "Label": {
                  "Name": "bar",
                  "NamePos": {}
                },
                "Optional": {},
                "Token": 47,
                "TokenPos": {},
                "Value": {
                  "Name": "_",
                  "NamePos": {}
                }
              }
            ],
            "Lbrace": {},
            "Rbrace": {}
          }
        },
        {
          "Attrs": [],
          "Label": {
            "Name": "foo",
            "NamePos": {}
          },
          "Optional": {},
          "Token": 47,
          "TokenPos": {},
          "Value": {
            "Elts": [
              {
                "Clauses": [
                  {
                    "Colon": {},
                    "For": {},
                    "In": {},
                    "Key": {
                      "Name": "_",
                      "NamePos": {}
                    },
                    "Source": {
                      "Name": "s",
                      "NamePos": {}
                    },
                    "Value": {
                      "Name": "a",
                      "NamePos": {}
                    }
                  },
                  {
                    "Condition": {
                      "Op": 32,
                      "OpPos": {},
                      "X": {
                        "Sel": {
                          "Name": "a",
                          "NamePos": {}
                        },
                        "X": {
                          "Name": "a",
                          "NamePos": {}
                        }
                      },
                      "Y": {
                        "Bottom": {}
                      }
                    },
                    "If": {}
                  }
                ],
                "Value": {
                  "Elts": [
                    {
                      "Expr": {
                        "Name": "a",
                        "NamePos": {}
                      }
                    }
                  ],
                  "Lbrace": {},
                  "Rbrace": {}
                }
              }
            ],
            "Lbrack": {},
            "Rbrack": {}
          }
        }
      ],
      "Filename": "",
      "Imports": [],
      "Unresolved": [
        {
          "Name": "string",
          "NamePos": {}
        },
        {
          "Name": "string",
          "NamePos": {}
        },
        {
          "Name": "_",
          "NamePos": {}
        },
        {
          "Name": "string",
          "NamePos": {}
        },
        {
          "Name": "string",
          "NamePos": {}
        },
        {
          "Name": "_",
          "NamePos": {}
        }
      ]
    });
  });

  if (variant !== "slim") {
    test(`parses cue schema - ${variant}`, async () => {
      const cue = await CUE.init(variant);
      const result = cue.schema`
      #Identity: {
        // first name of the person
        first: =~ "[A-Z].*"
        // Last name of the person
        Last: =~ "[A-Z].*"
        // Age of the person
        Age?: number & < 130
      }
      `;
      // TODO: fails with slim version
      expect(result).toEqual({
        "$schema": "http://json-schema.org/draft-04/schema#",
        Identity: {
          type: "object",
          required: [
            "first",
            "Last"
          ],
          properties: {
            first: {
              description: "first name of the person",
              type: "string",
              pattern: "[A-Z].*"
            },
            Last: {
              description: "Last name of the person",
              type: "string",
              pattern: "[A-Z].*"
            },
            Age: {
              description: "Age of the person",
              type: "number",
              maximum: 130,
              exclusiveMaximum: true
            }
          }
        }
      });
    });
  }
})



