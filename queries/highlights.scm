; Onyx syntax highlighting queries
; Matches the actual implemented syntax in onyx-syntax crate

; Keywords
[
  "op"
  "profile"
  "fn"
  "let"
  "use"
  "run"
  "with"
  "zip"
  "emit"
  "path"
  "if"
  "else"
  "match"
  "env"
  "in"
] @keyword

; Operators
[
  "+"
  "-"
  "*"
  "/"
  "%"
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
  "&&"
  "||"
  "!"
  "|>"
  "~="
  "->"
  "=>"
  ".."
  "..="
] @operator

; Delimiters
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  "."
  ":"
  "::"
] @punctuation.delimiter

; Literals
(null) @constant.builtin
(boolean) @boolean
(integer) @number
(float) @number.float
(string) @string
(byte_string) @string.special
(duration) @number
(size) @number

; Escape sequences in strings
(escape_sequence) @string.escape
(interpolation
  "${" @punctuation.special
  "}" @punctuation.special)

; Comments
(line_comment) @comment
(block_comment) @comment

; Identifiers
(identifier) @variable

; Declarations
(op_declaration
  name: (identifier) @function)

(profile_declaration
  name: (identifier) @type)

(function_declaration
  name: (identifier) @function)

(let_declaration
  pattern: (identifier) @variable)

(parameter) @variable.parameter

; Op definition
(op_definition
  protocol: (identifier) @module
  method: (identifier) @function.method)

; Function calls
(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (field_expression
    field: (identifier) @function.method))

; Field access
(field_expression
  field: (identifier) @property)

; Object fields
(field
  key: (identifier) @property)

; Run expressions
(run_expression
  target: (identifier) @function)

(run_step
  name: (identifier) @variable
  operation: (identifier) @function)

; Path chains
(path_chain
  (identifier) @variable)

; Environment references
(env_reference
  "env" @variable.builtin
  name: (identifier) @variable.builtin)

; Match guards
(match_guard
  "if" @keyword)

; Range patterns
(range_pattern) @constant

; Patterns
(wildcard_pattern) @variable.builtin

; Use paths
(use_path
  (identifier) @module)

(use_glob
  (identifier) @module
  "*" @operator)

(use_group
  (identifier) @module)

; Match arms
(match_arm
  pattern: (identifier) @constant)

; Lambda parameters
(lambda_expression
  params: (identifier) @variable.parameter)
