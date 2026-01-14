; Onyx syntax highlighting queries

; Keywords
[
  "op"
  "profile"
  "fn"
  "let"
  "use"
  "import"
  "run"
  "with"
  "zip"
  "check"
  "emit"
  "when"
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
(regex) @string.regexp
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

(parameter
  name: (identifier) @variable.parameter)

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

; Generators
(generator_expression
  "~" @operator
  kind: (identifier) @function.builtin)

; Packs
(pack_expression
  "@" @operator
  source: (identifier) @constant)

; Environment references
(env_reference
  "env" @variable.builtin
  name: (identifier) @variable.builtin)

; Severity levels
(severity) @type.builtin

; Stream aggregators
(stream_aggregator) @function.builtin

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

; Import paths
(import_declaration
  path: (string) @string.special.path)

; Match arms
(match_arm
  pattern: (identifier) @constant)

; Lambda parameters
(lambda_expression
  params: (identifier) @variable.parameter)

; Type annotations
(type_annotation) @type
