# Tree-Sitter Grammar for Onyx

A [Tree-sitter](https://tree-sitter.github.io/) grammar for the Onyx DSL - a declarative, security-focused language for API testing.

## Features

- Complete language support for all Onyx constructs
- Syntax highlighting via queries
- Code navigation (locals and tags queries)
- Error recovery for robust parsing
- String interpolation support
- Comprehensive literal types
- Pattern matching

## Installation

### For Development

```bash
npm install
```

### Build Parser

```bash
npm run generate
```

### Run Tests

```bash
npm test
```

### Build WASM

```bash
npm run build-wasm
```

## Language Features Supported

### Declarations
- `op` - Operation definitions
- `profile` - Configuration profiles
- `fn` - Function definitions
- `let` - Variable bindings
- `use` - Import paths, globs, and groups
- `import` - File imports

### Expressions
- Binary operations: `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `<`, `<=`, `>`, `>=`, `&&`, `||`
- Unary operations: `!`, `-`
- Pipe operator: `|>`
- Field access: `.`
- Index access: `[]`
- Function calls
- Lambda expressions: `|params| body`
- If expressions
- Match expressions with guards

### Literals
- Integers: `42`, `0xFF`, `0o755`, `0b1010`
- Floats: `3.14`, `1.5e10`
- Strings: `"text"`, `'text'` with interpolation `${expr}`
- Byte strings: `b"data"`
- Regular expressions: `/pattern/flags`
- Durations: `30s`, `5m`, `2h`
- Sizes: `1kb`, `500mb`, `2gb`
- Booleans: `true`, `false`
- Null: `null`

### Collections
- Arrays: `[1, 2, 3]`
- Objects: `{ key: value }`

### Control Flow
- If-else expressions
- Match expressions with patterns
- Pattern matching: wildcards, ranges, destructuring

### Special Constructs
- Run blocks with steps
- Check blocks with assertions
- Stream aggregators: `all()`, `any()`, `none()`
- When rules for conditional checks
- Emit expressions for output formatting
- Generator expressions: `~type(args)`
- Pack expressions: `@source`
- Environment references: `env.VAR`

## Editor Integration

### Neovim

Add to your Neovim config:

```lua
local parser_config = require "nvim-treesitter.parsers".get_parser_configs()
parser_config.onyx = {
  install_info = {
    url = "path/to/tree-sitter-onyx",
    files = {"src/parser.c"},
    branch = "main",
  },
  filetype = "onyx",
}

-- Syntax highlighting
vim.treesitter.language.register('onyx', 'onyx')
```

### VS Code

The grammar can be used with the `onyx-lsp` language server for full IDE support.

### Helix

Add to your `languages.toml`:

```toml
[[language]]
name = "onyx"
scope = "source.onyx"
file-types = ["onyx"]
roots = []
comment-token = "//"
indent = { tab-width = 2, unit = "  " }

[[grammar]]
name = "onyx"
source = { path = "path/to/tree-sitter-onyx" }
```

## Queries

The grammar includes three query files:

### `highlights.scm`
Comprehensive syntax highlighting rules covering:
- Keywords and operators
- Literals and constants
- Identifiers and symbols
- Comments
- String interpolation
- Special constructs

### `locals.scm`
Scope and definition tracking for:
- Variable definitions
- Function parameters
- Local scopes
- References

### `tags.scm`
Navigation support for:
- Function definitions
- Type definitions
- Variable definitions
- Operation definitions

## Testing

Example Onyx code is provided in `examples/test_grammar.onyx`. Parse it with:

```bash
npm run parse examples/test_grammar.onyx
```

## Grammar Structure

The grammar uses precedence levels for proper operator precedence:

```
PIPE (lowest)
OR
AND
EQUALITY
COMPARE
ADD
MUL
UNARY
POSTFIX
PRIMARY (highest)
```

## Development

### Adding New Features

1. Update `grammar.js` with new rules
2. Run `npm run generate` to regenerate the parser
3. Update query files (`queries/*.scm`)
4. Add tests in `test/corpus/`
5. Run `npm test` to verify

### Debugging

To see the parse tree:

```bash
tree-sitter parse examples/test_grammar.onyx
```

To test specific patterns:

```bash
tree-sitter parse -d <<< "your onyx code here"
```

## Performance

The parser is designed for:
- Fast incremental parsing
- Low memory usage
- Robust error recovery
- Efficient highlighting queries

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- All tests pass (`npm test`)
- Grammar generates without warnings
- Query files are updated for new constructs
- Examples demonstrate new features
