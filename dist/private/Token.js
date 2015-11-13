'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../CompileError', './MsAst'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../CompileError'), require('./MsAst'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.MsAst);
		global.Token = mod.exports;
	}
})(this, function (exports, _CompileError, _MsAst) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Keywords = exports.reservedKeywords = exports.Groups = exports.DocComment = exports.Name = exports.Keyword = exports.Group = undefined;
	exports.showGroupKind = showGroupKind;
	exports.keywordName = keywordName;
	exports.showKeyword = showKeyword;
	exports.opKeywordKindFromName = opKeywordKindFromName;
	exports.opKeywordKindToSpecialValueKind = opKeywordKindToSpecialValueKind;
	exports.isGroup = isGroup;
	exports.isKeyword = isKeyword;
	exports.isAnyKeyword = isAnyKeyword;
	exports.isNameKeyword = isNameKeyword;
	exports.isReservedKeyword = isReservedKeyword;

	class Token {
		constructor(loc) {
			this.loc = loc;
		}

	}

	exports.default = Token;

	class Group extends Token {
		constructor(loc, subTokens, kind) {
			super(loc);
			this.subTokens = subTokens;
			this.kind = kind;
		}

		toString() {
			return `${ groupKindToName.get(this.kind) }`;
		}

	}

	exports.Group = Group;

	class Keyword extends Token {
		constructor(loc, kind) {
			super(loc);
			this.kind = kind;
		}

		toString() {
			return showKeyword(this.kind);
		}

	}

	exports.Keyword = Keyword;

	class Name extends Token {
		constructor(loc, name) {
			super(loc);
			this.name = name;
		}

		toString() {
			return (0, _CompileError.code)(this.name);
		}

	}

	exports.Name = Name;

	class DocComment extends Token {
		constructor(loc, text) {
			super(loc);
			this.text = text;
		}

		toString() {
			return 'doc comment';
		}

	}

	exports.DocComment = DocComment;
	let nextGroupKind = 0;

	const groupKindToName = new Map(),
	      g = name => {
		const kind = nextGroupKind;
		groupKindToName.set(kind, name);
		nextGroupKind = nextGroupKind + 1;
		return kind;
	};

	const Groups = exports.Groups = {
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
	};

	function showGroupKind(groupKind) {
		return groupKindToName.get(groupKind);
	}

	let nextKeywordKind = 0;
	const keywordNameToKind = new Map(),
	      keywordKindToName = new Map(),
	      nameKeywords = new Set();
	const reservedKeywords = exports.reservedKeywords = new Set();

	function kw(name) {
		const kind = kwNotName(name);
		nameKeywords.add(kind);
		keywordNameToKind.set(name, kind);
		return kind;
	}

	function kwNotName(debugName) {
		const kind = nextKeywordKind;
		keywordKindToName.set(kind, debugName);
		nextKeywordKind = nextKeywordKind + 1;
		return kind;
	}

	function kwReserved(name) {
		const kind = kw(name);
		reservedKeywords.add(kind);
	}

	const reservedWords = ['enum', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'arguments', 'async', 'await', 'const', 'delete', 'eval', 'in', 'instanceof', 'let', 'return', 'typeof', 'var', 'void', 'while', '!', '<', '>', 'actor', 'data', 'del?', 'do-while', 'do-until', 'final', 'is', 'meta', 'out', 'override', 'send', 'to', 'type', 'until'];

	for (const name of reservedWords) kwReserved(name);

	const Keywords = exports.Keywords = {
		Abstract: kw('abstract'),
		Ampersand: kwNotName('&'),
		And: kw('and'),
		As: kw('as'),
		Assert: kw('assert'),
		AssertNot: kw('forbid'),
		Assign: kw('='),
		AssignMutable: kwNotName('::='),
		LocalMutate: kwNotName(':='),
		Break: kw('break'),
		Built: kw('built'),
		Case: kw('case'),
		Catch: kw('catch'),
		Cond: kw('cond'),
		Class: kw('class'),
		Construct: kw('construct'),
		Debugger: kw('debugger'),
		Del: kw('del'),
		Do: kw('do'),
		Dot: kwNotName('.'),
		Dot2: kwNotName('..'),
		Dot3: kwNotName('... '),
		Else: kw('else'),
		Except: kw('except'),
		False: kw('false'),
		Finally: kw('finally'),
		Focus: kw('_'),
		ForBag: kw('@for'),
		For: kw('for'),
		Fun: kwNotName('|'),
		FunDo: kwNotName('!|'),
		FunThis: kwNotName('.|'),
		FunThisDo: kwNotName('.!|'),
		FunAsync: kwNotName('$|'),
		FunAsyncDo: kwNotName('$!|'),
		FunThisAsync: kwNotName('.$|'),
		FunThisAsyncDo: kwNotName('.$!|'),
		FunGen: kwNotName('*|'),
		FunGenDo: kwNotName('*!|'),
		FunThisGen: kwNotName('.*|'),
		FunThisGenDo: kwNotName('.*!|'),
		Get: kw('get'),
		If: kw('if'),
		Ignore: kw('ignore'),
		Kind: kw('kind'),
		Lazy: kwNotName('~'),
		MapEntry: kw('->'),
		Method: kw('method'),
		Name: kw('name'),
		New: kw('new'),
		Not: kw('not'),
		Null: kw('null'),
		ObjAssign: kwNotName('. '),
		Of: kw('of'),
		Or: kw('or'),
		Pass: kw('pass'),
		Region: kw('region'),
		Set: kw('set'),
		Super: kw('super'),
		Static: kw('static'),
		Switch: kw('switch'),
		Tick: kwNotName('\''),
		Throw: kw('throw'),
		Todo: kw('todo'),
		True: kw('true'),
		Try: kw('try'),
		Type: kwNotName(':'),
		Undefined: kw('undefined'),
		Unless: kw('unless'),
		Import: kw('import'),
		ImportDo: kw('import!'),
		ImportLazy: kw('import~'),
		With: kw('with'),
		Yield: kw('<-'),
		YieldTo: kw('<-*')
	};

	function keywordName(kind) {
		return keywordKindToName.get(kind);
	}

	function showKeyword(kind) {
		return (0, _CompileError.code)(keywordName(kind));
	}

	function opKeywordKindFromName(name) {
		const kind = keywordNameToKind.get(name);
		return kind === undefined ? null : kind;
	}

	function opKeywordKindToSpecialValueKind(kind) {
		switch (kind) {
			case Keywords.False:
				return _MsAst.SpecialVals.False;

			case Keywords.Name:
				return _MsAst.SpecialVals.Name;

			case Keywords.Null:
				return _MsAst.SpecialVals.Null;

			case Keywords.True:
				return _MsAst.SpecialVals.True;

			case Keywords.Undefined:
				return _MsAst.SpecialVals.Undefined;

			default:
				return null;
		}
	}

	function isGroup(groupKind, token) {
		return token instanceof Group && token.kind === groupKind;
	}

	function isKeyword(keywordKind, token) {
		return token instanceof Keyword && token.kind === keywordKind;
	}

	function isAnyKeyword(keywordKinds, token) {
		return token instanceof Keyword && keywordKinds.has(token.kind);
	}

	function isNameKeyword(token) {
		return isAnyKeyword(nameKeywords, token);
	}

	function isReservedKeyword(token) {
		return isAnyKeyword(reservedKeywords, token);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1Rva2VuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0E4SmdCLGFBQWEsR0FBYixhQUFhO1NBcUtiLFdBQVcsR0FBWCxXQUFXO1NBSVgsV0FBVyxHQUFYLFdBQVc7U0FRWCxxQkFBcUIsR0FBckIscUJBQXFCO1NBS3JCLCtCQUErQixHQUEvQiwrQkFBK0I7U0FzQi9CLE9BQU8sR0FBUCxPQUFPO1NBU1AsU0FBUyxHQUFULFNBQVM7U0FTVCxZQUFZLEdBQVosWUFBWTtTQUtaLGFBQWEsR0FBYixhQUFhO1NBS2IsaUJBQWlCLEdBQWpCLGlCQUFpQjs7T0F0WFosS0FBSzs7Ozs7OzttQkFBTCxLQUFLOztPQVViLEtBQUs7Ozs7Ozs7Ozs7Ozs7U0FBTCxLQUFLLEdBQUwsS0FBSzs7T0F5QkwsT0FBTzs7Ozs7Ozs7Ozs7O1NBQVAsT0FBTyxHQUFQLE9BQU87O09BZ0JQLElBQUk7Ozs7Ozs7Ozs7OztTQUFKLElBQUksR0FBSixJQUFJOztPQWlCSixVQUFVOzs7Ozs7Ozs7Ozs7U0FBVixVQUFVLEdBQVYsVUFBVTs7Ozs7Ozs7Ozs7T0EwQlYsTUFBTSxXQUFOLE1BQU0sR0FBRzs7Ozs7Ozs7QUFVckIsYUFBVyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUM7O0FBRXBCLFNBQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDOzs7Ozs7QUFNaEIsT0FBSyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQzs7Ozs7QUFLMUIsT0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7Ozs7Ozs7Ozs7OztBQVlqQixNQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQzs7Ozs7O0FBTWYsT0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7RUFDakI7O1VBTWUsYUFBYTs7Ozs7Ozs7T0FVaEIsZ0JBQWdCLFdBQWhCLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09B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S0FBSyxDQUFDO0VBQ2xCOztVQU9lLFdBQVc7Ozs7VUFJWCxXQUFXOzs7O1VBUVgscUJBQXFCOzs7OztVQUtyQiwrQkFBK0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFzQi9CLE9BQU87Ozs7VUFTUCxTQUFTOzs7O1VBU1QsWUFBWTs7OztVQUtaLGFBQWE7Ozs7VUFLYixpQkFBaUIiLCJmaWxlIjoiVG9rZW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvZGV9IGZyb20gJy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7U3BlY2lhbFZhbHN9IGZyb20gJy4vTXNBc3QnXG5cbi8qKlxuTGV4ZWQgZWxlbWVudCBpbiBhIHRyZWUgb2YgVG9rZW5zLlxuXG5TaW5jZSB7QGxpbmsgbGV4fSBkb2VzIGdyb3VwaW5nLCB7QGxpbmsgcGFyc2V9IGF2b2lkcyBkb2luZyBtdWNoIG9mIHRoZSB3b3JrIHBhcnNlcnMgdXN1YWxseSBkbztcbml0IGRvZXNuJ3QgaGF2ZSB0byBoYW5kbGUgYSBcImxlZnQgcGFyZW50aGVzaXNcIiwgb25seSBhIHtAbGluayBHcm91cH0gb2Yga2luZCBHX1BhcmVudGhlc2lzLlxuVGhpcyBhbHNvIG1lYW5zIHRoYXQgdGhlIG1hbnkgZGlmZmVyZW50IHtAbGluayBNc0FzdH0gdHlwZXMgYWxsIHBhcnNlIGluIGEgc2ltaWxhciBtYW5uZXIsXG5rZWVwaW5nIHRoZSBsYW5ndWFnZSBjb25zaXN0ZW50LlxuXG5CZXNpZGVzIHtAbGluayBHcm91cH0sIHtAbGluayBLZXl3b3JkfSwge0BsaW5rIE5hbWV9LCBhbmQge0BsaW5rIERvY0NvbW1lbnR9LFxue0BsaW5rIE51bWJlckxpdGVyYWx9IHZhbHVlcyBhcmUgYWxzbyB0cmVhdGVkIGFzIFRva2Vucy5cblxuQGFic3RyYWN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9rZW4ge1xuXHRjb25zdHJ1Y3Rvcihsb2MpIHtcblx0XHR0aGlzLmxvYyA9IGxvY1xuXHR9XG59XG5cbi8qKlxuQ29udGFpbnMgbXVsdGlwbGUgc3ViLXRva2Vucy5cblNlZSB7QGxpbmsgR3JvdXBLaW5kfSBmb3IgZXhwbGFuYXRpb25zLlxuKi9cbmV4cG9ydCBjbGFzcyBHcm91cCBleHRlbmRzIFRva2VuIHtcblx0Y29uc3RydWN0b3IobG9jLCBzdWJUb2tlbnMsIGtpbmQpIHtcblx0XHRzdXBlcihsb2MpXG5cdFx0LyoqXG5cdFx0VG9rZW5zIHdpdGhpbiB0aGlzIGdyb3VwLlxuXHRcdEB0eXBlIHtBcnJheTxUb2tlbj59XG5cdFx0Ki9cblx0XHR0aGlzLnN1YlRva2VucyA9IHN1YlRva2Vuc1xuXHRcdC8qKiBAdHlwZSB7R3JvdXBzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBgJHtncm91cEtpbmRUb05hbWUuZ2V0KHRoaXMua2luZCl9YFxuXHR9XG59XG5cbi8qKlxuQSBcImtleXdvcmRcIiBpcyBhbnkgc2V0IG9mIGNoYXJhY3RlcnMgd2l0aCBhIHBhcnRpY3VsYXIgbWVhbmluZy5cbkl0IGRvZW5zbid0IG5lY2Vzc2FyaWx5IGhhdmUgdG8gYmUgc29tZXRoaW5nIHRoYXQgbWlnaHQgaGF2ZSBiZWVuIGEge0BsaW5rIE5hbWV9LlxuRm9yIGV4YW1wbGUsIHNlZSB7QGxpbmsgS2V5d29yZHMuT2JqRW50cnl9LlxuXG5UaGlzIGNhbiBldmVuIGluY2x1ZGUgb25lcyBsaWtlIGAuIGAgKGRlZmluZXMgYW4gb2JqZWN0IHByb3BlcnR5LCBhcyBpbiBga2V5LiB2YWx1ZWApLlxuS2luZCBpcyBhICoqKi4gU2VlIHRoZSBmdWxsIGxpc3QgYmVsb3cuXG4qL1xuZXhwb3J0IGNsYXNzIEtleXdvcmQgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywga2luZCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge0tleXdvcmRzfSAqL1xuXHRcdHRoaXMua2luZCA9IGtpbmRcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBzaG93S2V5d29yZCh0aGlzLmtpbmQpXG5cdH1cbn1cblxuLyoqXG5BbiBpZGVudGlmaWVyLiBVc3VhbGx5IHRoZSBuYW1lIG9mIHNvbWUgbG9jYWwgdmFyaWFibGUgb3IgcHJvcGVydHkuXG5BIE5hbWUgaXMgZ3VhcmFudGVlZCB0byBub3QgYmUgYW55IGtleXdvcmQuXG4qL1xuZXhwb3J0IGNsYXNzIE5hbWUgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywgbmFtZSkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHR0aGlzLm5hbWUgPSBuYW1lXG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gY29kZSh0aGlzLm5hbWUpXG5cdH1cbn1cblxuLyoqXG5Eb2N1bWVudGF0aW9uIGNvbW1lbnQgKGJlZ2lubmluZyB3aXRoIG9uZSBgfGAgcmF0aGVyIHRoYW4gdHdvKS5cbk5vbi1kb2MgY29tbWVudHMgYXJlIGlnbm9yZWQgYnkge0BsaW5rIGxleH0uXG5UaGVzZSBkb24ndCBhZmZlY3Qgb3V0cHV0LCBidXQgYXJlIHBhc3NlZCB0byB2YXJpb3VzIHtAbGluayBNc0FzdH1zIGZvciB1c2UgYnkgb3RoZXIgdG9vbHMuXG4qL1xuZXhwb3J0IGNsYXNzIERvY0NvbW1lbnQgZXh0ZW5kcyBUb2tlbiB7XG5cdGNvbnN0cnVjdG9yKGxvYywgdGV4dCkge1xuXHRcdHN1cGVyKGxvYylcblx0XHQvKiogQHR5cGUge3N0cmluZ30gKi9cblx0XHR0aGlzLnRleHQgPSB0ZXh0XG5cdH1cblxuXHR0b1N0cmluZygpIHtcblx0XHRyZXR1cm4gJ2RvYyBjb21tZW50J1xuXHR9XG59XG5cbmxldCBuZXh0R3JvdXBLaW5kID0gMFxuY29uc3Rcblx0Z3JvdXBLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHRnID0gbmFtZSA9PiB7XG5cdFx0Y29uc3Qga2luZCA9IG5leHRHcm91cEtpbmRcblx0XHRncm91cEtpbmRUb05hbWUuc2V0KGtpbmQsIG5hbWUpXG5cdFx0bmV4dEdyb3VwS2luZCA9IG5leHRHcm91cEtpbmQgKyAxXG5cdFx0cmV0dXJuIGtpbmRcblx0fVxuXG4vKipcbktpbmRzIG9mIHtAbGluayBHcm91cH0uXG5AZW51bSB7bnVtYmVyfVxuKi9cbmV4cG9ydCBjb25zdCBHcm91cHMgPSB7XG5cdC8qKlxuXHRUb2tlbnMgc3Vycm91bmRlZCBieSBwYXJlbnRoZXNlcy5cblx0VGhlcmUgbWF5IGJlIG5vIGNsb3NpbmcgcGFyZW50aGVzaXMuIEluOlxuXG5cdFx0YSAoYlxuXHRcdFx0Y1xuXG5cdFRoZSB0b2tlbnMgYXJlIGEgR3JvdXA8TGluZT4oTmFtZSwgR3JvdXA8UGFyZW50aGVzaXM+KC4uLikpXG5cdCovXG5cdFBhcmVudGhlc2lzOiBnKCcoKScpLFxuXHQvKiogTGlrZSBgUGFyZW50aGVzaXNgLCBidXQgc2ltcGxlciBiZWNhdXNlIHRoZXJlIG11c3QgYmUgYSBjbG9zaW5nIGBdYC4gKi9cblx0QnJhY2tldDogZygnW10nKSxcblx0LyoqXG5cdExpbmVzIGluIGFuIGluZGVudGVkIGJsb2NrLlxuXHRTdWItdG9rZW5zIHdpbGwgYWx3YXlzIGJlIGBMaW5lYCBncm91cHMuXG5cdE5vdGUgdGhhdCBgQmxvY2tgcyBkbyBub3QgYWx3YXlzIG1hcCB0byBCbG9jayogTXNBc3RzLlxuXHQqL1xuXHRCbG9jazogZygnaW5kZW50ZWQgYmxvY2snKSxcblx0LyoqXG5cdFRva2VucyB3aXRoaW4gYSBxdW90ZS5cblx0YHN1YlRva2Vuc2AgbWF5IGJlIHN0cmluZ3MsIG9yIEdfUGFyZW50aGVzaXMgZ3JvdXBzLlxuXHQqL1xuXHRRdW90ZTogZygncXVvdGUnKSxcblx0LyoqXG5cdFRva2VucyBvbiBhIGxpbmUuXG5cdFRoZSBpbmRlbnRlZCBibG9jayBmb2xsb3dpbmcgdGhlIGVuZCBvZiB0aGUgbGluZSBpcyBjb25zaWRlcmVkIHRvIGJlIGEgcGFydCBvZiB0aGUgbGluZSFcblx0VGhpcyBtZWFucyB0aGF0IGluIHRoaXMgY29kZTpcblx0XHRhXG5cdFx0XHRiXG5cdFx0XHRjXG5cdFx0ZFxuXHRUaGVyZSBhcmUgMiBsaW5lcywgb25lIHN0YXJ0aW5nIHdpdGggJ2EnIGFuZCBvbmUgc3RhcnRpbmcgd2l0aCAnZCcuXG5cdFRoZSBmaXJzdCBsaW5lIGNvbnRhaW5zICdhJyBhbmQgYSBgQmxvY2tgIHdoaWNoIGluIHR1cm4gY29udGFpbnMgdHdvIG90aGVyIGxpbmVzLlxuXHQqL1xuXHRMaW5lOiBnKCdsaW5lJyksXG5cdC8qKlxuXHRHcm91cHMgdHdvIG9yIG1vcmUgdG9rZW5zIHRoYXQgYXJlICpub3QqIHNlcGFyYXRlZCBieSBzcGFjZXMuXG5cdGBhW2JdLmNgIGlzIGFuIGV4YW1wbGUuXG5cdEEgc2luZ2xlIHRva2VuIG9uIGl0cyBvd24gd2lsbCBub3QgYmUgZ2l2ZW4gYSBgU3BhY2VgIGdyb3VwLlxuXHQqL1xuXHRTcGFjZTogZygnc3BhY2UnKVxufVxuXG4vKipcbk91dHB1dHRhYmxlIGRlc2NyaXB0aW9uIG9mIGEgZ3JvdXAga2luZC5cbkBwYXJhbSB7R3JvdXBzfSBncm91cEtpbmRcbiovXG5leHBvcnQgZnVuY3Rpb24gc2hvd0dyb3VwS2luZChncm91cEtpbmQpIHtcblx0cmV0dXJuIGdyb3VwS2luZFRvTmFtZS5nZXQoZ3JvdXBLaW5kKVxufVxuXG5sZXQgbmV4dEtleXdvcmRLaW5kID0gMFxuY29uc3Rcblx0a2V5d29yZE5hbWVUb0tpbmQgPSBuZXcgTWFwKCksXG5cdGtleXdvcmRLaW5kVG9OYW1lID0gbmV3IE1hcCgpLFxuXHRuYW1lS2V5d29yZHMgPSBuZXcgU2V0KClcbi8vIEV4cG9ydGVkIGZvciB1c2UgYnkgaW5mby5qc1xuZXhwb3J0IGNvbnN0IHJlc2VydmVkS2V5d29yZHMgPSBuZXcgU2V0KClcblxuLy8gVGhlc2Uga2V5d29yZHMgYXJlIHNwZWNpYWwgbmFtZXMuXG4vLyBXaGVuIGxleGluZyBhIG5hbWUsIGEgbWFwIGxvb2t1cCBpcyBkb25lIGJ5IGtleXdvcmRLaW5kRnJvbU5hbWUuXG5mdW5jdGlvbiBrdyhuYW1lKSB7XG5cdGNvbnN0IGtpbmQgPSBrd05vdE5hbWUobmFtZSlcblx0bmFtZUtleXdvcmRzLmFkZChraW5kKVxuXHRrZXl3b3JkTmFtZVRvS2luZC5zZXQobmFtZSwga2luZClcblx0cmV0dXJuIGtpbmRcbn1cbi8vIFRoZXNlIGtleXdvcmRzIG11c3QgYmUgbGV4ZWQgc3BlY2lhbGx5LlxuZnVuY3Rpb24ga3dOb3ROYW1lKGRlYnVnTmFtZSkge1xuXHRjb25zdCBraW5kID0gbmV4dEtleXdvcmRLaW5kXG5cdGtleXdvcmRLaW5kVG9OYW1lLnNldChraW5kLCBkZWJ1Z05hbWUpXG5cdG5leHRLZXl3b3JkS2luZCA9IG5leHRLZXl3b3JkS2luZCArIDFcblx0cmV0dXJuIGtpbmRcbn1cbmZ1bmN0aW9uIGt3UmVzZXJ2ZWQobmFtZSkge1xuXHRjb25zdCBraW5kID0ga3cobmFtZSlcblx0cmVzZXJ2ZWRLZXl3b3Jkcy5hZGQoa2luZClcbn1cblxuY29uc3QgcmVzZXJ2ZWRXb3JkcyA9IFtcblx0Ly8gSmF2YVNjcmlwdCByZXNlcnZlZCB3b3Jkc1xuXHQnZW51bScsXG5cdCdpbXBsZW1lbnRzJyxcblx0J2ludGVyZmFjZScsXG5cdCdwYWNrYWdlJyxcblx0J3ByaXZhdGUnLFxuXHQncHJvdGVjdGVkJyxcblx0J3B1YmxpYycsXG5cblx0Ly8gSmF2YVNjcmlwdCBrZXl3b3Jkc1xuXHQnYXJndW1lbnRzJyxcblx0J2FzeW5jJyxcblx0J2F3YWl0Jyxcblx0J2NvbnN0Jyxcblx0J2RlbGV0ZScsXG5cdCdldmFsJyxcblx0J2luJyxcblx0J2luc3RhbmNlb2YnLFxuXHQnbGV0Jyxcblx0J3JldHVybicsXG5cdCd0eXBlb2YnLFxuXHQndmFyJyxcblx0J3ZvaWQnLFxuXHQnd2hpbGUnLFxuXG5cdC8vIE1hc29uIHJlc2VydmVkIHdvcmRzXG5cdCchJyxcblx0JzwnLFxuXHQnPicsXG5cdCdhY3RvcicsXG5cdCdkYXRhJyxcblx0J2RlbD8nLFxuXHQnZG8td2hpbGUnLFxuXHQnZG8tdW50aWwnLFxuXHQnZmluYWwnLFxuXHQnaXMnLFxuXHQnbWV0YScsXG5cdCdvdXQnLFxuXHQnb3ZlcnJpZGUnLFxuXHQnc2VuZCcsXG5cdCd0bycsXG5cdCd0eXBlJyxcblx0J3VudGlsJ1xuXVxuXG5mb3IgKGNvbnN0IG5hbWUgb2YgcmVzZXJ2ZWRXb3Jkcylcblx0a3dSZXNlcnZlZChuYW1lKVxuXG4vKiogS2luZHMgb2Yge0BsaW5rIEtleXdvcmR9LiAqL1xuZXhwb3J0IGNvbnN0IEtleXdvcmRzID0ge1xuXHRBYnN0cmFjdDoga3coJ2Fic3RyYWN0JyksXG5cdEFtcGVyc2FuZDoga3dOb3ROYW1lKCcmJyksXG5cdEFuZDoga3coJ2FuZCcpLFxuXHRBczoga3coJ2FzJyksXG5cdEFzc2VydDoga3coJ2Fzc2VydCcpLFxuXHRBc3NlcnROb3Q6IGt3KCdmb3JiaWQnKSxcblx0QXNzaWduOiBrdygnPScpLFxuXHRBc3NpZ25NdXRhYmxlOiBrd05vdE5hbWUoJzo6PScpLFxuXHRMb2NhbE11dGF0ZToga3dOb3ROYW1lKCc6PScpLFxuXHRCcmVhazoga3coJ2JyZWFrJyksXG5cdEJ1aWx0OiBrdygnYnVpbHQnKSxcblx0Q2FzZToga3coJ2Nhc2UnKSxcblx0Q2F0Y2g6IGt3KCdjYXRjaCcpLFxuXHRDb25kOiBrdygnY29uZCcpLFxuXHRDbGFzczoga3coJ2NsYXNzJyksXG5cdENvbnN0cnVjdDoga3coJ2NvbnN0cnVjdCcpLFxuXHREZWJ1Z2dlcjoga3coJ2RlYnVnZ2VyJyksXG5cdERlbDoga3coJ2RlbCcpLFxuXHREbzoga3coJ2RvJyksXG5cdERvdDoga3dOb3ROYW1lKCcuJyksXG5cdERvdDI6IGt3Tm90TmFtZSgnLi4nKSxcblx0RG90Mzoga3dOb3ROYW1lKCcuLi4gJyksXG5cdEVsc2U6IGt3KCdlbHNlJyksXG5cdEV4Y2VwdDoga3coJ2V4Y2VwdCcpLFxuXHRGYWxzZToga3coJ2ZhbHNlJyksXG5cdEZpbmFsbHk6IGt3KCdmaW5hbGx5JyksXG5cdEZvY3VzOiBrdygnXycpLFxuXHRGb3JCYWc6IGt3KCdAZm9yJyksXG5cdEZvcjoga3coJ2ZvcicpLFxuXHRGdW46IGt3Tm90TmFtZSgnfCcpLFxuXHRGdW5Ebzoga3dOb3ROYW1lKCchfCcpLFxuXHRGdW5UaGlzOiBrd05vdE5hbWUoJy58JyksXG5cdEZ1blRoaXNEbzoga3dOb3ROYW1lKCcuIXwnKSxcblx0RnVuQXN5bmM6IGt3Tm90TmFtZSgnJHwnKSxcblx0RnVuQXN5bmNEbzoga3dOb3ROYW1lKCckIXwnKSxcblx0RnVuVGhpc0FzeW5jOiBrd05vdE5hbWUoJy4kfCcpLFxuXHRGdW5UaGlzQXN5bmNEbzoga3dOb3ROYW1lKCcuJCF8JyksXG5cdEZ1bkdlbjoga3dOb3ROYW1lKCcqfCcpLFxuXHRGdW5HZW5Ebzoga3dOb3ROYW1lKCcqIXwnKSxcblx0RnVuVGhpc0dlbjoga3dOb3ROYW1lKCcuKnwnKSxcblx0RnVuVGhpc0dlbkRvOiBrd05vdE5hbWUoJy4qIXwnKSxcblx0R2V0OiBrdygnZ2V0JyksXG5cdElmOiBrdygnaWYnKSxcblx0SWdub3JlOiBrdygnaWdub3JlJyksXG5cdEtpbmQ6IGt3KCdraW5kJyksXG5cdExhenk6IGt3Tm90TmFtZSgnficpLFxuXHRNYXBFbnRyeToga3coJy0+JyksXG5cdE1ldGhvZDoga3coJ21ldGhvZCcpLFxuXHROYW1lOiBrdygnbmFtZScpLFxuXHROZXc6IGt3KCduZXcnKSxcblx0Tm90OiBrdygnbm90JyksXG5cdE51bGw6IGt3KCdudWxsJyksXG5cdE9iakFzc2lnbjoga3dOb3ROYW1lKCcuICcpLFxuXHRPZjoga3coJ29mJyksXG5cdE9yOiBrdygnb3InKSxcblx0UGFzczoga3coJ3Bhc3MnKSxcblx0UmVnaW9uOiBrdygncmVnaW9uJyksXG5cdFNldDoga3coJ3NldCcpLFxuXHRTdXBlcjoga3coJ3N1cGVyJyksXG5cdFN0YXRpYzoga3coJ3N0YXRpYycpLFxuXHRTd2l0Y2g6IGt3KCdzd2l0Y2gnKSxcblx0VGljazoga3dOb3ROYW1lKCdcXCcnKSxcblx0VGhyb3c6IGt3KCd0aHJvdycpLFxuXHRUb2RvOiBrdygndG9kbycpLFxuXHRUcnVlOiBrdygndHJ1ZScpLFxuXHRUcnk6IGt3KCd0cnknKSxcblx0VHlwZToga3dOb3ROYW1lKCc6JyksXG5cdFVuZGVmaW5lZDoga3coJ3VuZGVmaW5lZCcpLFxuXHRVbmxlc3M6IGt3KCd1bmxlc3MnKSxcblx0SW1wb3J0OiBrdygnaW1wb3J0JyksXG5cdEltcG9ydERvOiBrdygnaW1wb3J0IScpLFxuXHRJbXBvcnRMYXp5OiBrdygnaW1wb3J0ficpLFxuXHRXaXRoOiBrdygnd2l0aCcpLFxuXHRZaWVsZDoga3coJzwtJyksXG5cdFlpZWxkVG86IGt3KCc8LSonKVxufVxuXG4vKipcbk5hbWUgb2YgYSBrZXl3b3JkLlxuQHBhcmFtIHtLZXl3b3Jkc30ga2luZFxuQHJldHVybiB7c3RyaW5nfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBrZXl3b3JkTmFtZShraW5kKSB7XG5cdHJldHVybiBrZXl3b3JkS2luZFRvTmFtZS5nZXQoa2luZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dLZXl3b3JkKGtpbmQpIHtcblx0cmV0dXJuIGNvZGUoa2V5d29yZE5hbWUoa2luZCkpXG59XG5cbi8qKlxuU2VlIGlmIHRoZSBuYW1lIGlzIGEga2V5d29yZCBhbmQgaWYgc28gcmV0dXJuIGl0cyBraW5kLlxuQHJldHVybiB7P0tleXdvcmRzfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBvcEtleXdvcmRLaW5kRnJvbU5hbWUobmFtZSkge1xuXHRjb25zdCBraW5kID0ga2V5d29yZE5hbWVUb0tpbmQuZ2V0KG5hbWUpXG5cdHJldHVybiBraW5kID09PSB1bmRlZmluZWQgPyBudWxsIDoga2luZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3BLZXl3b3JkS2luZFRvU3BlY2lhbFZhbHVlS2luZChraW5kKSB7XG5cdHN3aXRjaCAoa2luZCkge1xuXHRcdGNhc2UgS2V5d29yZHMuRmFsc2U6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuRmFsc2Vcblx0XHRjYXNlIEtleXdvcmRzLk5hbWU6XG5cdFx0XHRyZXR1cm4gU3BlY2lhbFZhbHMuTmFtZVxuXHRcdGNhc2UgS2V5d29yZHMuTnVsbDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5OdWxsXG5cdFx0Y2FzZSBLZXl3b3Jkcy5UcnVlOlxuXHRcdFx0cmV0dXJuIFNwZWNpYWxWYWxzLlRydWVcblx0XHRjYXNlIEtleXdvcmRzLlVuZGVmaW5lZDpcblx0XHRcdHJldHVybiBTcGVjaWFsVmFscy5VbmRlZmluZWRcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEdyb3VwIG9mIHRoZSBnaXZlbiBraW5kLlxuQHBhcmFtIHtHcm91cHN9IGdyb3VwS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNHcm91cChncm91cEtpbmQsIHRva2VuKSB7XG5cdHJldHVybiB0b2tlbiBpbnN0YW5jZW9mIEdyb3VwICYmIHRva2VuLmtpbmQgPT09IGdyb3VwS2luZFxufVxuXG4vKipcbldoZXRoZXIgYHRva2VuYCBpcyBhIEtleXdvcmQgb2YgdGhlIGdpdmVuIGtpbmQuXG5AcGFyYW0ge0tleXdvcmRzfSBrZXl3b3JkS2luZFxuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNLZXl3b3JkKGtleXdvcmRLaW5kLCB0b2tlbikge1xuXHRyZXR1cm4gdG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkICYmIHRva2VuLmtpbmQgPT09IGtleXdvcmRLaW5kXG59XG5cbi8qKlxuV2hldGhlciBgdG9rZW5gIGlzIGEgS2V5d29yZCBvZiBhbnkgb2YgdGhlIGdpdmVuIGtpbmRzLlxuQHBhcmFtIHtTZXR9IGtleXdvcmRLaW5kc1xuQHBhcmFtIHtUb2tlbn0gdG9rZW5cbiovXG5leHBvcnQgZnVuY3Rpb24gaXNBbnlLZXl3b3JkKGtleXdvcmRLaW5kcywgdG9rZW4pIHtcblx0cmV0dXJuIHRva2VuIGluc3RhbmNlb2YgS2V5d29yZCAmJiBrZXl3b3JkS2luZHMuaGFzKHRva2VuLmtpbmQpXG59XG5cbi8qKiBXaGV0aGVyIGB0b2tlbmAgaXMgYSBLZXl3b3JkIHdob3NlIHZhbHVlIGNhbiBiZSB1c2VkIGFzIGEgcHJvcGVydHkgbmFtZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVLZXl3b3JkKHRva2VuKSB7XG5cdHJldHVybiBpc0FueUtleXdvcmQobmFtZUtleXdvcmRzLCB0b2tlbilcbn1cblxuLyoqIFdoZXRoZXIgYHRva2VuYCBpcyBhIHJlc2VydmVkIHdvcmQuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXNlcnZlZEtleXdvcmQodG9rZW4pIHtcblx0cmV0dXJuIGlzQW55S2V5d29yZChyZXNlcnZlZEtleXdvcmRzLCB0b2tlbilcbn1cbiJdfQ==