import {code} from '../CompileError'
import {SpecialVals} from './MsAst'

/**
Lexed element in a tree of Tokens.

Since {@link lex} does grouping, {@link parse} avoids doing much of the work parsers usually do;
it doesn't have to handle a "left parenthesis", only a {@link Group} of kind G_Parenthesis.
This also means that the many different {@link MsAst} types all parse in a similar manner,
keeping the language consistent.

Besides {@link Group}, {@link Keyword}, {@link Name}, and {@link DocComment},
{@link NumberLiteral} values are also treated as Tokens.

@abstract
*/
export default class Token {
	constructor(loc) {
		this.loc = loc
	}
}

/**
Contains multiple sub-tokens.
See {@link GroupKind} for explanations.
*/
export class Group extends Token {
	constructor(loc, subTokens, kind) {
		super(loc)
		/**
		Tokens within this group.
		@type {Array<Token>}
		*/
		this.subTokens = subTokens
		/** @type {Groups} */
		this.kind = kind
	}

	toString() {
		return `${groupKindToName.get(this.kind)}`
	}
}

/**
A "keyword" is any set of characters with a particular meaning.
It doensn't necessarily have to be something that might have been a {@link Name}.
For example, see {@link Keywords.ObjEntry}.

This can even include ones like `. ` (defines an object property, as in `key. value`).
Kind is a ***. See the full list below.
*/
export class Keyword extends Token {
	constructor(loc, kind) {
		super(loc)
		/** @type {Keywords} */
		this.kind = kind
	}

	toString() {
		return code(keywordKindToName.get(this.kind))
	}
}

/**
An identifier. Usually the name of some local variable or property.
A Name is guaranteed to not be any keyword.
*/
export class Name extends Token {
	constructor(loc, name /* String */) {
		super(loc)
		this.name = name
	}

	toString() {
		return code(this.name)
	}
}

/**
Documentation comment (beginning with one `|` rather than two).
Non-doc comments are ignored by {@link lex}.
These don't affect output, but are passed to various {@link MsAst}s for use by other tools.
*/
export class DocComment extends Token {
	constructor(loc, text) {
		super(loc)
		/** @type {string} */
		this.text = text
	}

	toString() {
		return 'doc comment'
	}
}

let nextGroupKind = 0
const
	groupKindToName = new Map(),
	g = name => {
		const kind = nextGroupKind
		groupKindToName.set(kind, name)
		nextGroupKind = nextGroupKind + 1
		return kind
	}

/**
Kinds of {@link Group}.
@enum {number}
*/
export const Groups = {
	/**
	Tokens surrounded by parentheses.
	There may be no closing parenthesis. In:

		a (b
			c

	The tokens are a Group<Line>(Name, Group<Parenthesis>(...))
	*/
	Parenthesis: g('()'),
	/** Like `Parenthesis`, but simpler because there must be a closing `]`. */
	Bracket: g('[]'),
	/**
	Lines in an indented block.
	Sub-tokens will always be `Line` groups.
	Note that `Block`s do not always map to Block* MsAsts.
	*/
	Block: g('indented block'),
	/**
	Tokens within a quote.
	`subTokens` may be strings, or G_Parenthesis groups.
	*/
	Quote: g('quote'),
	/**
	Tokens on a line.
	The indented block following the end of the line is considered to be a part of the line!
	This means that in this code:
		a
			b
			c
		d
	There are 2 lines, one starting with 'a' and one starting with 'd'.
	The first line contains 'a' and a `Block` which in turn contains two other lines.
	*/
	Line: g('line'),
	/**
	Groups two or more tokens that are *not* separated by spaces.
	`a[b].c` is an example.
	A single token on its own will not be given a `Space` group.
	*/
	Space: g('space')
}

/**
Outputtable description of a group kind.
@param {Groups} groupKind
*/
export function showGroupKind(groupKind) {
	return groupKindToName.get(groupKind)
}

let nextKeywordKind = 0
const
	keywordNameToKind = new Map(),
	keywordKindToName = new Map(),
	nameKeywords = new Set(),
	reservedKeywords = new Set(),
	// These keywords are special names.
	// When lexing a name, a map lookup is done by keywordKindFromName.
	kw = name => {
		const kind = kwNotName(name)
		nameKeywords.add(kind)
		keywordNameToKind.set(name, kind)
		return kind
	},
	// These keywords must be lexed specially.
	kwNotName = debugName => {
		const kind = nextKeywordKind
		keywordKindToName.set(kind, debugName)
		nextKeywordKind = nextKeywordKind + 1
		return kind
	},
	kwReserved = name => {
		const kind = kw(name)
		reservedKeywords.add(kind)
	}

const reserved_words = [
	// JavaScript reserved words
	'enum',
	'implements',
	'interface',
	'package',
	'private',
	'protected',
	'public',

	// JavaScript keywords
	'arguments',
	'await',
	'const',
	'delete',
	'eval',
	'in',
	'instanceof',
	'let',
	'return',
	'typeof',
	'var',
	'void',
	'while',

	// mason reserved words
	'abstract',
	'actor',
	'await!',
	'data',
	'del?',
	'else!',
	'final',
	'is',
	'meta',
	'out',
	'send',
	'to',
	'until',
	'until!',
	'while!'
]

for (const name of reserved_words)
	kwReserved(name)

/** Kinds of {@link Keyword}. */
export const Keywords = {
	And: kw('and'),
	As: kw('as'),
	Assert: kw('assert!'),
	AssertNot: kw('forbid!'),
	Assign: kw('='),
	AssignMutable: kwNotName('::='),
	LocalMutate: kwNotName(':='),
	Break: kw('break!'),
	BreakWithVal: kw('break'),
	Built: kw('built'),
	CaseDo: kw('case!'),
	CaseVal: kw('case'),
	CatchDo: kw('catch!'),
	CatchVal: kw('catch'),
	Cond: kw('cond'),
	Class: kw('class'),
	Construct: kw('construct!'),
	Debugger: kw('debugger!'),
	DelDo: kw('del!'),
	DelVal: kw('del'),
	Do: kw('do!'),
	Dot: kwNotName('.'),
	Ellipsis: kwNotName('... '),
	Else: kw('else'),
	ExceptDo: kw('except!'),
	ExceptVal: kw('except'),
	False: kw('false'),
	Finally: kw('finally!'),
	Focus: kw('_'),
	ForBag: kw('@for'),
	ForDo: kw('for!'),
	ForVal: kw('for'),
	Fun: kwNotName('|'),
	FunDo: kwNotName('!|'),
	FunThis: kwNotName('.|'),
	FunThisDo: kwNotName('.!|'),
	FunAsync: kwNotName('$|'),
	FunAsyncDo: kwNotName('$!|'),
	FunThisAsync: kwNotName('.$|'),
	FunThisAsyncDo: kwNotName('.$!|'),
	FunGen: kwNotName('~|'),
	FunGenDo: kwNotName('~!|'),
	FunThisGen: kwNotName('.~|'),
	FunThisGenDo: kwNotName('.~!|'),
	Get: kw('get'),
	IfVal: kw('if'),
	IfDo: kw('if!'),
	Ignore: kw('ignore'),
	Lazy: kwNotName('~'),
	MapEntry: kw('->'),
	Name: kw('name'),
	New: kw('new'),
	Not: kw('not'),
	Null: kw('null'),
	ObjAssign: kwNotName('. '),
	Of: kw('of'),
	Or: kw('or'),
	Pass: kw('pass'),
	Region: kw('region'),
	Set: kw('set!'),
	SuperDo: kw('super!'),
	SuperVal: kw('super'),
	Static: kw('static'),
	SwitchDo: kw('switch!'),
	SwitchVal: kw('switch'),
	Throw: kw('throw!'),
	Todo: kw('todo'),
	True: kw('true'),
	TryDo: kw('try!'),
	TryVal: kw('try'),
	Type: kwNotName(':'),
	Undefined: kw('undefined'),
	UnlessVal: kw('unless'),
	UnlessDo: kw('unless!'),
	Import: kw('import'),
	ImportDo: kw('import!'),
	ImportLazy: kw('import~'),
	With: kw('with'),
	Yield: kw('<~'),
	YieldTo: kw('<~~')
}

/**
Name of a keyword.
@param {Keywords} kind
@return {string}
*/
export function keywordName(kind) {
	return keywordKindToName.get(kind)
}

/**
See if the name is a keyword and if so return its kind.
@return {?Keywords}
*/
export function opKeywordKindFromName(name) {
	const kind = keywordNameToKind.get(name)
	return kind === undefined ? null : kind
}

export function opKeywordKindToSpecialValueKind(kind) {
	switch (kind) {
		case Keywords.False:
			return SpecialVals.False
		case Keywords.Name:
			return SpecialVals.Name
		case Keywords.Null:
			return SpecialVals.Null
		case Keywords.True:
			return SpecialVals.True
		case Keywords.Undefined:
			return SpecialVals.Undefined
		default:
			return null
	}
}

/**
Whether `token` is a Group of the given kind.
@param {Groups} groupKind
@param {Token} token
*/
export function isGroup(groupKind, token) {
	return token instanceof Group && token.kind === groupKind
}

/**
Whether `token` is a Keyword of the given kind.
@param {Keywords} keywordKind
@param {Token} token
*/
export function isKeyword(keywordKind, token) {
	return token instanceof Keyword && token.kind === keywordKind
}

/**
Whether `token` is a Keyword of any of the given kinds.
@param {Set} keywordKinds
@param {Token} token
*/
export function isAnyKeyword(keywordKinds, token) {
	return token instanceof Keyword && keywordKinds.has(token.kind)
}

/** Whether `token` is a Keyword whose value can be used as a property name. */
export function isNameKeyword(token) {
	return isAnyKeyword(nameKeywords, token)
}

/** Whether `token` is a reserved word. */
export function isReservedKeyword(token) {
	return isAnyKeyword(reservedKeywords, token)
}
