{
  "targets": [
    {
      "target_name": "tree_sitter_onyx_binding",
      "dependencies": [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except"
      ],
      "include_dirs": [
        "src"
      ],
      "sources": [
        "bindings/node/binding.cc",
        "src/parser.c"
      ],
      "conditions": [
        ["OS!='win'", {
          "cflags_c": [
            "-std=c11",
            "-fvisibility=hidden"
          ]
        }],
        ["OS=='mac'", {
          "xcode_settings": {
            "MACOSX_DEPLOYMENT_TARGET": "10.9",
            "CLANG_CXX_LANGUAGE_STANDARD": "c++17"
          }
        }]
      ]
    }
  ]
}
