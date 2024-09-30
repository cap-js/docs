```log
> @cap-js/cds-typer@0.26.0 --help

SYNOPSIS

  cds-typer [cds file | "*"]

  Generates type information based on a CDS model.
  Call with at least one positional parameter pointing
  to the (root) CDS file you want to compile.

OPTIONS

  --help

    This text.

  --inlineDeclarations
  --inline_declarations: <flat | structured>
    (default: structured)

    Whether to resolve inline type declarations
    flat: (x_a, x_b, ...)
    or structured: (x: {a, b}).

  --IEEE754Compatible
  --ieee754compatible: <true | false>
    (default: false)

    If set to true, floating point properties are generated
    as IEEE754 compatible '(number | string)' instead of 'number'.

  --jsConfigPath
  --js_config_path: <string>

    Path to where the jsconfig.json should be written.
    If specified, cds-typer will create a jsconfig.json file and
    set it up to restrict property usage in types entities to
    existing properties only.

  --logLevel
  --log_level SILENT | ERROR | WARN | INFO | DEBUG | TRACE | SILLY | VERBOSE
    (default: ERROR)

    Minimum log level that is printed.
    The default is only used if no explicit value is passed
    and there is no configuration passed via cds.env either.

  --outputDirectory
  --output_directory: <string>
    (default: ./)

    Root directory to write the generated files to.

  --propertiesOptional
  --properties_optional: <true | false>
    (default: true)

    If set to true, properties in entities are
    always generated as optional (a?: T).

  --useEntitiesProxy
  --use_entities_proxy: <true | false>
    (default: false)

    If set to true the 'cds.entities' exports in the generated 'index.js'
    files will be wrapped in 'Proxy' objects
    so static import/require calls can be used everywhere.
    
    WARNING: entity properties can still only be accessed after
    'cds.entities' has been loaded

  --version

    Prints the version of this tool.

```