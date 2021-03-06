'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError);
		global.chars = mod.exports;
	}
})(this, function (exports, _CompileError) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.isNameCharacter = exports.isDigitHex = exports.isDigitOctal = exports.isDigitBinary = exports.isDigit = exports.Chars = undefined;
	exports.showChar = showChar;

	function cc(_) {
		return _.charCodeAt(0);
	}

	const Chars = exports.Chars = {
		Ampersand: cc('&'),
		Backslash: cc('\\'),
		Backtick: cc('`'),
		Bang: cc('!'),
		Bar: cc('|'),
		Caret: cc('^'),
		Cash: cc('$'),
		CloseBrace: cc('}'),
		CloseBracket: cc(']'),
		CloseParenthesis: cc(')'),
		Colon: cc(':'),
		Comma: cc(','),
		Dot: cc('.'),
		Equal: cc('='),
		Hyphen: cc('-'),
		LetterB: cc('b'),
		LetterO: cc('o'),
		LetterX: cc('x'),
		N0: cc('0'),
		N1: cc('1'),
		N2: cc('2'),
		N3: cc('3'),
		N4: cc('4'),
		N5: cc('5'),
		N6: cc('6'),
		N7: cc('7'),
		N8: cc('8'),
		N9: cc('9'),
		Newline: cc('\n'),
		Null: cc('\0'),
		OpenBrace: cc('{'),
		OpenBracket: cc('['),
		OpenParenthesis: cc('('),
		Percent: cc('%'),
		Quote: cc('"'),
		Semicolon: cc(';'),
		Space: cc(' '),
		Star: cc('*'),
		Tab: cc('\t'),
		Tick: cc('\''),
		Tilde: cc('~')
	};

	function showChar(char) {
		return (0, _CompileError.code)(String.fromCharCode(char));
	}

	function charPred(chars) {
		let negate = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
		let src = 'switch(ch) {\n';

		for (let i = 0; i < chars.length; i = i + 1) src = `${ src }case ${ chars.charCodeAt(i) }: `;

		src = `${ src } return ${ !negate }\ndefault: return ${ negate }\n}`;
		return Function('ch', src);
	}

	const isDigit = exports.isDigit = charPred('0123456789'),
	      isDigitBinary = exports.isDigitBinary = charPred('01'),
	      isDigitOctal = exports.isDigitOctal = charPred('01234567'),
	      isDigitHex = exports.isDigitHex = charPred('0123456789abcdef');
	const reservedCharacters = '`#%^\\;,';
	const isNameCharacter = exports.isNameCharacter = charPred(`()[]{}\'&.:| \n\t"${ reservedCharacters }`, true);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL2xleC9jaGFycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBa0RnQixRQUFRLEdBQVIsUUFBUTs7Ozs7O09BNUNYLEtBQUssV0FBTCxLQUFLLEdBQUc7QUFDcEIsV0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDbEIsV0FBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDbkIsVUFBUSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDakIsTUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDYixLQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNaLE9BQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2QsTUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDYixZQUFVLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNuQixjQUFZLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNyQixrQkFBZ0IsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pCLE9BQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2QsT0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDZCxLQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNaLE9BQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2QsUUFBTSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDZixTQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNoQixTQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNoQixTQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNoQixJQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLElBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ1gsSUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDWCxJQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLElBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ1gsSUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDWCxJQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLElBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ1gsSUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDWCxJQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNYLFNBQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2pCLE1BQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2QsV0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDbEIsYUFBVyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDcEIsaUJBQWUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3hCLFNBQU8sRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2hCLE9BQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ2QsV0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDbEIsT0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDZCxNQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUNiLEtBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2IsTUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDZCxPQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQztFQUNkOztVQUVlLFFBQVE7Ozs7O01BSUMsTUFBTSx5REFBRyxLQUFLOzs7Ozs7Ozs7T0FTdEMsT0FBTyxXQUFQLE9BQU8sR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDO09BQ2hDLGFBQWEsV0FBYixhQUFhLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztPQUM5QixZQUFZLFdBQVosWUFBWSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7T0FDbkMsVUFBVSxXQUFWLFVBQVUsR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUM7O09BSTdCLGVBQWUsV0FBZixlQUFlLEdBQUcsUUFBUSxDQUFDLENBQUMsa0JBQWtCLEdBQUUsa0JBQWtCLEVBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyIsImZpbGUiOiJjaGFycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Y29kZX0gZnJvbSAnLi4vLi4vQ29tcGlsZUVycm9yJ1xuXG5mdW5jdGlvbiBjYyhfKSB7XG5cdHJldHVybiBfLmNoYXJDb2RlQXQoMClcbn1cblxuZXhwb3J0IGNvbnN0IENoYXJzID0ge1xuXHRBbXBlcnNhbmQ6IGNjKCcmJyksXG5cdEJhY2tzbGFzaDogY2MoJ1xcXFwnKSxcblx0QmFja3RpY2s6IGNjKCdgJyksXG5cdEJhbmc6IGNjKCchJyksXG5cdEJhcjogY2MoJ3wnKSxcblx0Q2FyZXQ6IGNjKCdeJyksXG5cdENhc2g6IGNjKCckJyksXG5cdENsb3NlQnJhY2U6IGNjKCd9JyksXG5cdENsb3NlQnJhY2tldDogY2MoJ10nKSxcblx0Q2xvc2VQYXJlbnRoZXNpczogY2MoJyknKSxcblx0Q29sb246IGNjKCc6JyksXG5cdENvbW1hOiBjYygnLCcpLFxuXHREb3Q6IGNjKCcuJyksXG5cdEVxdWFsOiBjYygnPScpLFxuXHRIeXBoZW46IGNjKCctJyksXG5cdExldHRlckI6IGNjKCdiJyksXG5cdExldHRlck86IGNjKCdvJyksXG5cdExldHRlclg6IGNjKCd4JyksXG5cdE4wOiBjYygnMCcpLFxuXHROMTogY2MoJzEnKSxcblx0TjI6IGNjKCcyJyksXG5cdE4zOiBjYygnMycpLFxuXHRONDogY2MoJzQnKSxcblx0TjU6IGNjKCc1JyksXG5cdE42OiBjYygnNicpLFxuXHRONzogY2MoJzcnKSxcblx0Tjg6IGNjKCc4JyksXG5cdE45OiBjYygnOScpLFxuXHROZXdsaW5lOiBjYygnXFxuJyksXG5cdE51bGw6IGNjKCdcXDAnKSxcblx0T3BlbkJyYWNlOiBjYygneycpLFxuXHRPcGVuQnJhY2tldDogY2MoJ1snKSxcblx0T3BlblBhcmVudGhlc2lzOiBjYygnKCcpLFxuXHRQZXJjZW50OiBjYygnJScpLFxuXHRRdW90ZTogY2MoJ1wiJyksXG5cdFNlbWljb2xvbjogY2MoJzsnKSxcblx0U3BhY2U6IGNjKCcgJyksXG5cdFN0YXI6IGNjKCcqJyksXG5cdFRhYjogY2MoJ1xcdCcpLFxuXHRUaWNrOiBjYygnXFwnJyksXG5cdFRpbGRlOiBjYygnficpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2hhcihjaGFyKSB7XG5cdHJldHVybiBjb2RlKFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhcikpXG59XG5cbmZ1bmN0aW9uIGNoYXJQcmVkKGNoYXJzLCBuZWdhdGUgPSBmYWxzZSkge1xuXHRsZXQgc3JjID0gJ3N3aXRjaChjaCkge1xcbidcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRzcmMgPSBgJHtzcmN9Y2FzZSAke2NoYXJzLmNoYXJDb2RlQXQoaSl9OiBgXG5cdHNyYyA9IGAke3NyY30gcmV0dXJuICR7IW5lZ2F0ZX1cXG5kZWZhdWx0OiByZXR1cm4gJHtuZWdhdGV9XFxufWBcblx0cmV0dXJuIEZ1bmN0aW9uKCdjaCcsIHNyYylcbn1cblxuZXhwb3J0IGNvbnN0XG5cdGlzRGlnaXQgPSBjaGFyUHJlZCgnMDEyMzQ1Njc4OScpLFxuXHRpc0RpZ2l0QmluYXJ5ID0gY2hhclByZWQoJzAxJyksXG5cdGlzRGlnaXRPY3RhbCA9IGNoYXJQcmVkKCcwMTIzNDU2NycpLFxuXHRpc0RpZ2l0SGV4ID0gY2hhclByZWQoJzAxMjM0NTY3ODlhYmNkZWYnKVxuXG4vLyBBbnl0aGluZyBub3QgZXhwbGljaXRseSByZXNlcnZlZCBpcyBhIHZhbGlkIG5hbWUgY2hhcmFjdGVyLlxuY29uc3QgcmVzZXJ2ZWRDaGFyYWN0ZXJzID0gJ2AjJV5cXFxcOywnXG5leHBvcnQgY29uc3QgaXNOYW1lQ2hhcmFjdGVyID0gY2hhclByZWQoYCgpW117fVxcJyYuOnwgXFxuXFx0XCIke3Jlc2VydmVkQ2hhcmFjdGVyc31gLCB0cnVlKVxuIl19