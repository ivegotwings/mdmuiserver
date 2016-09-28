Prism.languages.bro = {

	'comment': {
		pattern: /(^|[^\\$])#.*/,
		lookbehind: true,
			inside: {
				'italic':  /\b(TODO|FIXME|XXX)\b/
		}
	},

	'string': {
		pattern: /(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},

	'boolean': /\b(T|F)\b/,

	'function': {
		pattern: /(?:function|hook|event) [a-zA-Z0-9_]+(::[a-zA-Z0-9_]+)?/,
		inside: {
			keyword: /^(?:function|hook|event)/
		}
	},

	'variable':	{
		pattern: /(?:global|local) [a-zA-Z0-9_]+/i,
		inside: {
			keyword: /(?:global|local)/
		}
	},

	'builtin':
		/(@(load(-(sigs|plugin))?|unload|prefixes|ifn?def|else|(end)?if|DIR|FILENAME))|(&?(redef|priority|log|optional|default|add_func|delete_func|expire_func|read_expire|write_expire|create_expire|synchronized|persistent|rotate_interval|rotate_size|encrypt|raw_output|mergeable|group|error_handler|type_column))/,

	'constant': {
		pattern: /const [a-zA-Z0-9_]+/i,
		inside: {
			keyword: /const/
		}
	},

	'keyword':
		/\b(break|next|continue|alarm|using|of|add|delete|export|print|return|schedule|when|timeout|addr|any|bool|count|double|enum|file|int|interval|pattern|opaque|port|record|set|string|subnet|table|time|vector|for|if|else|in|module|function)\b/,

	'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&|\|\|?|\?|\*|\/|~|\^|%/,

	'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,

	'punctuation': /[{}[\];(),.:]/
};
