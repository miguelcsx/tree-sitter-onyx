; Onyx locals queries for scope analysis

; Scopes
(source_file) @local.scope
(block) @local.scope
(run_block) @local.scope
(check_block) @local.scope
(function_declaration) @local.scope
(lambda_expression) @local.scope

; Definitions
(let_declaration
  pattern: (identifier) @local.definition)

(function_declaration
  name: (identifier) @local.definition)

(op_declaration
  name: (identifier) @local.definition)

(profile_declaration
  name: (identifier) @local.definition)

(parameter
  name: (identifier) @local.definition)

(run_step
  name: (identifier) @local.definition)

(lambda_expression
  params: (identifier) @local.definition)

; References
(identifier) @local.reference
