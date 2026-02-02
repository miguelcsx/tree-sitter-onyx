/**
 * Tree-sitter grammar for Onyx DSL
 * A declarative language for API testing
 *
 * IMPORTANT: This grammar matches the ACTUAL implementation in onyx-syntax crate.
 */

const PREC = {
  PIPE: 1,
  OR: 2,
  AND: 3,
  EQUALITY: 4,
  COMPARE: 5,
  ADD: 6,
  MUL: 7,
  UNARY: 8,
  POSTFIX: 9,
  PRIMARY: 10,
};

// Helper functions (following BAML patterns)
const sepBy1 = (sep, rule) => seq(rule, repeat(seq(sep, rule)));
const sepBy = (sep, rule) => optional(sepBy1(sep, rule));
const commaSep1 = (rule) => sepBy1(",", rule);
const commaSep = (rule) => sepBy(",", rule);

module.exports = grammar({
  name: "onyx",

  extras: ($) => [/\s/, $.line_comment, $.block_comment],

  word: ($) => $.identifier,

  conflicts: ($) => [
    [$.run_expression],
    [$.object, $.block],
  ],

  supertypes: ($) => [$._expression, $._declaration, $._literal],

  rules: {
    // =========================================================================
    // Program
    // =========================================================================
    source_file: ($) => repeat($._item),

    _item: ($) => choice($._declaration, $._expression),

    // =========================================================================
    // Declarations
    // =========================================================================
    _declaration: ($) =>
      choice(
        $.op_declaration,
        $.profile_declaration,
        $.function_declaration,
        $.let_declaration,
        $.use_declaration,
      ),

    op_declaration: ($) =>
      seq(
        "op",
        field("name", $.identifier),
        "=",
        field("definition", $.op_definition),
      ),

    op_definition: ($) =>
      prec.right(
        seq(
          field("protocol", $.identifier),
          ".",
          field("method", $.identifier),
          field("target", $.string),
          optional(field("query", $.string)),
          optional(field("metadata", $.object)),
        ),
      ),

    profile_declaration: ($) =>
      seq(
        "profile",
        field("name", $.identifier),
        field("body", $.profile_block),
      ),

    profile_block: ($) => seq("{", commaSep($.field), optional(","), "}"),

    function_declaration: ($) =>
      seq(
        "fn",
        field("name", $.identifier),
        "(",
        field("params", commaSep($.parameter)),
        ")",
        choice(seq("=", field("body", $._expression)), field("body", $.block)),
      ),

    parameter: ($) => field("name", $.identifier),

    let_declaration: ($) =>
      seq(
        "let",
        field("pattern", $._pattern),
        "=",
        field("value", $._expression),
      ),

    use_declaration: ($) =>
      prec.right(
        seq(
          "use",
          field("target", $._use_target),
          optional(field("body", $.block)),
        ),
      ),

    _use_target: ($) =>
      choice($.use_glob, $.use_group, $.use_path, $._expression),

    use_path: ($) =>
      prec(
        PREC.PRIMARY + 2,
        seq($.identifier, repeat1(seq("::", $.identifier))),
      ),

    use_glob: ($) =>
      prec(
        PREC.PRIMARY + 3,
        seq($.identifier, repeat(seq("::", $.identifier)), "::", "*"),
      ),

    use_group: ($) =>
      prec(
        PREC.PRIMARY + 2,
        seq(
          $.identifier,
          repeat(seq("::", $.identifier)),
          "::",
          "{",
          commaSep1($.identifier),
          "}",
        ),
      ),

    // =========================================================================
    // Expressions
    // =========================================================================
    _expression: ($) => $._pipe_or_binary,

    _pipe_or_binary: ($) => choice($.pipe_expression, $._binary),

    pipe_expression: ($) =>
      prec.left(
        PREC.PIPE,
        seq(field("left", $._pipe_or_binary), "|>", field("right", $._binary)),
      ),

    _binary: ($) => choice($.binary_expression, $._unary),

    binary_expression: ($) =>
      choice(
        prec.left(
          PREC.OR,
          seq(field("left", $._binary), "||", field("right", $._binary)),
        ),
        prec.left(
          PREC.AND,
          seq(field("left", $._binary), "&&", field("right", $._binary)),
        ),
        prec.left(
          PREC.EQUALITY,
          seq(
            field("left", $._binary),
            choice("==", "!="),
            field("right", $._binary),
          ),
        ),
        prec.left(
          PREC.COMPARE,
          seq(
            field("left", $._binary),
            choice("<", "<=", ">", ">=", "in", "~="),
            field("right", $._binary),
          ),
        ),
        prec.left(
          PREC.ADD,
          seq(
            field("left", $._binary),
            choice("+", "-"),
            field("right", $._binary),
          ),
        ),
        prec.left(
          PREC.MUL,
          seq(
            field("left", $._binary),
            choice("*", "/", "%"),
            field("right", $._binary),
          ),
        ),
      ),

    _unary: ($) => choice($.unary_expression, $._postfix),

    unary_expression: ($) =>
      prec(PREC.UNARY, seq(choice("!", "-"), field("operand", $._unary))),

    _postfix: ($) =>
      choice(
        $._primary,
        $.call_expression,
        $.field_expression,
        $.index_expression,
      ),

    call_expression: ($) =>
      prec.left(
        PREC.POSTFIX,
        seq(
          field("function", $._postfix),
          "(",
          field("arguments", commaSep($._expression)),
          ")",
        ),
      ),

    field_expression: ($) =>
      prec.left(
        PREC.POSTFIX,
        seq(field("object", $._postfix), ".", field("field", $.identifier)),
      ),

    index_expression: ($) =>
      prec.left(
        PREC.POSTFIX,
        seq(
          field("object", $._postfix),
          "[",
          field("index", $._expression),
          "]",
        ),
      ),

    // =========================================================================
    // Primary expressions
    // =========================================================================
    _primary: ($) =>
      prec(
        PREC.PRIMARY,
        choice(
          $._literal,
          $.identifier,
          $.env_reference,
          $.parenthesized_expression,
          $.array,
          $.object,
          $.block,
          $.if_expression,
          $.match_expression,
          $.lambda_expression,
          $.run_expression,
          $.emit_expression,
          $.range_expression,
        ),
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    env_reference: ($) => seq("env", ".", field("name", $.identifier)),

    // =========================================================================
    // Control flow
    // =========================================================================
    if_expression: ($) =>
      prec.right(
        seq(
          "if",
          field("condition", $._expression),
          field("then", $.block),
          optional(
            seq("else", field("else", choice($.block, $.if_expression))),
          ),
        ),
      ),

    match_expression: ($) =>
      seq(
        "match",
        field("value", $._expression),
        "{",
        commaSep($.match_arm),
        optional(","),
        "}",
      ),

    match_arm: ($) =>
      seq(
        field("pattern", $._pattern),
        optional(field("guard", $.match_guard)),
        "=>",
        field("body", $._expression),
      ),

    match_guard: ($) => seq("if", field("condition", $._expression)),

    // =========================================================================
    // Lambdas
    // =========================================================================
    lambda_expression: ($) =>
      seq(
        "|",
        field("params", commaSep($.identifier)),
        "|",
        field("body", $._expression),
      ),

    // =========================================================================
    // Run expressions
    // =========================================================================
    run_expression: ($) =>
      choice(
        seq(
          "run",
          field("target", $.identifier),
          optional(field("args", $.object)),
          optional(field("with", $.with_clause)),
        ),
        seq("run", field("block", $.run_block)),
      ),

    run_block: ($) => seq("{", repeat($._run_item), "}"),

    _run_item: ($) =>
      choice($.run_step, $.run_path, $._declaration),

    run_step: ($) =>
      prec(
        1,
        seq(
          field("name", $._step_name),
          ":",
          field("operation", $.identifier),
          optional(field("args", $.object)),
        ),
      ),

    // Step names can be identifiers or keywords used as names
    _step_name: ($) =>
      choice(
        $.identifier,
        alias("profile", $.identifier),
        alias("run", $.identifier),
        alias("path", $.identifier),
      ),

    run_path: ($) => prec(2, seq("path", ":", field("chain", $.path_chain))),

    path_chain: ($) => seq($.identifier, repeat1(seq("->", $.identifier))),

    with_clause: ($) =>
      seq("with", optional("zip"), field("variations", $.object)),

    // =========================================================================
    // Emit
    // =========================================================================
    emit_expression: ($) =>
      prec.left(
        PREC.PRIMARY,
        seq(
          "emit",
          optional(
            seq(
              token.immediate("."),
              field("format", $.identifier),
              optional(
                seq(
                  token.immediate("("),
                  field("args", commaSep($._expression)),
                  ")",
                ),
              ),
            ),
          ),
        ),
      ),

    // =========================================================================
    // Ranges
    // =========================================================================
    range_expression: ($) =>
      choice(
        // Full range: start..end or start..=end (most specific, try first)
        prec.left(
          PREC.COMPARE + 1,
          seq(
            field("start", $.integer),
            choice("..", "..="),
            field("end", $.integer),
          ),
        ),
        // Open-ended: ..end or ..=end
        prec.left(
          PREC.COMPARE,
          seq(choice("..", "..="), field("end", $.integer)),
        ),
        // Open-ended: start.. or start..=
        prec.left(
          PREC.COMPARE,
          seq(field("start", $.integer), choice("..", "..=")),
        ),
      ),

    // =========================================================================
    // Collections
    // =========================================================================
    array: ($) => seq("[", commaSep($._expression), optional(","), "]"),

    object: ($) => seq("{", commaSep($.field), optional(","), "}"),

    field: ($) =>
      seq(
        field("key", choice($.identifier, $.string)),
        ":",
        field("value", $._expression),
      ),

    block: ($) => seq("{", repeat($._statement), "}"),

    _statement: ($) => choice($._declaration, $._expression),

    // =========================================================================
    // Patterns
    // =========================================================================
    _pattern: ($) =>
      choice(
        $.range_pattern,
        $.identifier,
        $._literal,
        $.wildcard_pattern,
        $.array_pattern,
        $.object_pattern,
      ),

    wildcard_pattern: ($) => "_",

    // Range pattern for match arms: 1..10, ..5, 10..
    range_pattern: ($) =>
      prec.left(
        1,
        choice(
          seq(
            field("start", $._literal),
            choice("..", "..="),
            field("end", $._literal),
          ),
          seq(choice("..", "..="), field("end", $._literal)),
          seq(field("start", $._literal), choice("..", "..=")),
        ),
      ),

    array_pattern: ($) => seq("[", commaSep($._pattern), optional(","), "]"),

    object_pattern: ($) =>
      seq("{", commaSep($.field_pattern), optional(","), "}"),

    field_pattern: ($) =>
      seq(
        field("key", $.identifier),
        optional(seq(":", field("pattern", $._pattern))),
      ),

    // =========================================================================
    // Literals
    // =========================================================================
    _literal: ($) =>
      choice(
        $.null,
        $.boolean,
        $.float,
        $.integer,
        $.string,
        $.byte_string,
        $.duration,
        $.size,
      ),

    null: ($) => "null",

    boolean: ($) => choice("true", "false"),

    integer: ($) =>
      token(
        choice(/0[xX][0-9a-fA-F]+/, /0[oO][0-7]+/, /0[bB][01]+/, /-?[0-9]+/),
      ),

    float: ($) =>
      token(
        choice(/-?[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?/, /-?[0-9]+[eE][+-]?[0-9]+/),
      ),

    string: ($) => choice($._double_string, $._single_string),

    _double_string: ($) =>
      seq(
        '"',
        repeat(choice($._string_content, $.escape_sequence, $.interpolation)),
        '"',
      ),

    _single_string: ($) =>
      seq(
        "'",
        repeat(choice($._single_string_content, $.escape_sequence)),
        "'",
      ),

    _string_content: ($) => token.immediate(prec(1, /[^"\\$]+/)),
    _single_string_content: ($) => token.immediate(prec(1, /[^'\\]+/)),

    escape_sequence: ($) =>
      token.immediate(
        seq(
          "\\",
          choice(
            /[\\'"nrtbfv0]/,
            /x[0-9a-fA-F]{2}/,
            /u[0-9a-fA-F]{4}/,
            /u\{[0-9a-fA-F]+\}/,
          ),
        ),
      ),

    interpolation: ($) => seq(token.immediate("${"), $._expression, "}"),

    byte_string: ($) =>
      seq('b"', repeat(choice(/[^"\\]+/, $.escape_sequence)), '"'),

    duration: ($) =>
      token(seq(/[0-9]+(\.[0-9]+)?/, choice("ms", "s", "m", "h"))),

    size: ($) =>
      token(seq(/[0-9]+(\.[0-9]+)?/, choice("kb", "mb", "gb", "tb"))),

    // =========================================================================
    // Identifiers and comments
    // =========================================================================
    identifier: ($) => /[_a-zA-Z][_a-zA-Z0-9]*/,

    line_comment: ($) => token(seq("//", /.*/)),

    block_comment: ($) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
  },
});
