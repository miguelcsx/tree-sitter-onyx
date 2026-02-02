; Onyx tags queries for navigation
; Matches actual implemented syntax

(op_declaration
  name: (identifier) @name) @definition.function

(profile_declaration
  name: (identifier) @name) @definition.type

(function_declaration
  name: (identifier) @name) @definition.function

(let_declaration
  pattern: (identifier) @name) @definition.variable

(run_step
  name: (identifier) @name) @definition.variable
