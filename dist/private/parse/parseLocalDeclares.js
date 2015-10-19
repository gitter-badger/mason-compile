if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports', '../../CompileError', '../context', '../MsAst', '../Token', '../util', './checks', './parse*', './Slice'], function (exports, _CompileError, _context, _MsAst, _Token, _util, _checks, _parse, _Slice) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	exports.default = parseLocalDeclares;
	exports.parseLocalDeclaresJustNames = parseLocalDeclaresJustNames;
	exports.parseLocalDeclare = parseLocalDeclare;
	exports.parseLocalDeclareFromSpaced = parseLocalDeclareFromSpaced;
	exports.parseLocalDeclaresAndMemberArgs = parseLocalDeclaresAndMemberArgs;
	exports.parseLocalName = parseLocalName;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _Slice2 = _interopRequireDefault(_Slice);

	/**
 Parse locals (`a` or `a:b`).
 @return {Array<LocalDeclare>}
 */

	function parseLocalDeclares(tokens) {
		return tokens.map(parseLocalDeclare);
	}

	/**
 Parse locals with no types allowed.
 @return {Array<LocalDeclare>}
 */

	function parseLocalDeclaresJustNames(tokens) {
		return tokens.map(_ => _MsAst.LocalDeclare.plain(_.loc, parseLocalName(_)));
	}

	/** Parse a single local declare. */

	function parseLocalDeclare(token) {
		return _parseLocalDeclare(token);
	}

	/** Parse a single local declare from the tokens in a {@link Groups.Space}. */

	function parseLocalDeclareFromSpaced(tokens) {
		return _parseLocalDeclareFromSpaced(tokens);
	}

	/**
 For constructor. Parse local declares while allowing `.x`-style arguments.
 @return {{declares: Array<LocalDeclare>, memberArgs: Array<LocalDeclare>}}
 	`memberArgs` is  a subset of `declares`.
 */

	function parseLocalDeclaresAndMemberArgs(tokens) {
		const declares = [],
		      memberArgs = [];
		for (const token of tokens) {
			var _parseLocalDeclare2 = _parseLocalDeclare(token, true);

			const declare = _parseLocalDeclare2.declare;
			const isMember = _parseLocalDeclare2.isMember;

			declares.push(declare);
			if (isMember) memberArgs.push(declare);
		}
		return { declares, memberArgs };
	}

	/**
 Parse a name for a local variable.
 Unlike {@link parseName}, `_` is the only allowed Keyword.
 @return {string}
 */

	function parseLocalName(token) {
		if ((0, _Token.isKeyword)(_Token.Keywords.Focus, token)) return '_';else {
			(0, _context.check)(token instanceof _Token.Name, token.loc, () => `Expected a local name, not ${ token }.`);
			return token.name;
		}
	}

	function _parseLocalDeclare(token) {
		let orMember = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		if ((0, _Token.isGroup)(_Token.Groups.Space, token)) return _parseLocalDeclareFromSpaced(_Slice2.default.group(token), orMember);else {
			const declare = _MsAst.LocalDeclare.plain(token.loc, parseLocalName(token));
			return orMember ? { declare, isMember: false } : declare;
		}
	}

	function _parseLocalDeclareFromSpaced(tokens) {
		let orMember = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		var _ref = (0, _Token.isKeyword)(_Token.Keywords.Lazy, tokens.head()) ? [tokens.tail(), _MsAst.LocalDeclares.Lazy, false] : orMember && (0, _Token.isKeyword)(_Token.Keywords.Dot, tokens.head()) ? [tokens.tail(), _MsAst.LocalDeclares.Const, true] : [tokens, _MsAst.LocalDeclares.Const, false];

		var _ref2 = _slicedToArray(_ref, 3);

		const rest = _ref2[0];
		const kind = _ref2[1];
		const isMember = _ref2[2];

		const name = parseLocalName(rest.head());
		const rest2 = rest.tail();
		const opType = (0, _util.opIf)(!rest2.isEmpty(), () => {
			const colon = rest2.head();
			(0, _context.check)((0, _Token.isKeyword)(_Token.Keywords.Type, colon), colon.loc, () => `Expected ${ (0, _CompileError.code)(':') }`);
			const tokensType = rest2.tail();
			(0, _checks.checkNonEmpty)(tokensType, () => `Expected something after ${ colon }`);
			return (0, _parse.parseSpaced)(tokensType);
		});
		const declare = new _MsAst.LocalDeclare(tokens.loc, name, opType, kind);
		return orMember ? { declare, isMember } : declare;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlTG9jYWxEZWNsYXJlcy5qcyIsInByaXZhdGUvcGFyc2UvcGFyc2VMb2NhbERlY2xhcmVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7bUJDYXdCLGtCQUFrQjs7Ozs7Ozs7Ozs7Ozs7OztBQUEzQixVQUFTLGtCQUFrQixDQUFDLE1BQU0sRUFBRTtBQUNsRCxTQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtFQUNwQzs7Ozs7OztBQU1NLFVBQVMsMkJBQTJCLENBQUMsTUFBTSxFQUFFO0FBQ25ELFNBQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FwQmhCLFlBQVksQ0FvQmlCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFDcEU7Ozs7QUFHTSxVQUFTLGlCQUFpQixDQUFDLEtBQUssRUFBRTtBQUN4QyxTQUFPLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFBO0VBQ2hDOzs7O0FBR00sVUFBUywyQkFBMkIsQ0FBQyxNQUFNLEVBQUU7QUFDbkQsU0FBTyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtFQUMzQzs7Ozs7Ozs7QUFPTSxVQUFTLCtCQUErQixDQUFDLE1BQU0sRUFBRTtBQUN2RCxRQUFNLFFBQVEsR0FBRyxFQUFFO1FBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQTtBQUNwQyxPQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTs2QkFDQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDOztTQUFwRCxPQUFPLHVCQUFQLE9BQU87U0FBRSxRQUFRLHVCQUFSLFFBQVE7O0FBQ3hCLFdBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDdEIsT0FBSSxRQUFRLEVBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUN6QjtBQUNELFNBQU8sRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLENBQUE7RUFDN0I7Ozs7Ozs7O0FBT00sVUFBUyxjQUFjLENBQUMsS0FBSyxFQUFFO0FBQ3JDLE1BQUksV0F0RG9CLFNBQVMsRUFzRG5CLE9BdERxQixRQUFRLENBc0RwQixLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQ25DLE9BQU8sR0FBRyxDQUFBLEtBQ047QUFDSixnQkEzRE0sS0FBSyxFQTJETCxLQUFLLG1CQXpEaUMsSUFBSSxBQXlEckIsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQywyQkFBMkIsR0FBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNyRixVQUFPLEtBQUssQ0FBQyxJQUFJLENBQUE7R0FDakI7RUFDRDs7QUFHRCxVQUFTLGtCQUFrQixDQUFDLEtBQUssRUFBa0I7TUFBaEIsUUFBUSx5REFBQyxLQUFLOztBQUNoRCxNQUFJLFdBaEVXLE9BQU8sRUFnRVYsT0FoRUwsTUFBTSxDQWdFTSxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQy9CLE9BQU8sNEJBQTRCLENBQUMsZ0JBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFBLEtBQzdEO0FBQ0osU0FBTSxPQUFPLEdBQUcsT0FwRVYsWUFBWSxDQW9FVyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUNwRSxVQUFPLFFBQVEsR0FBRyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDLEdBQUcsT0FBTyxDQUFBO0dBQ3REO0VBQ0Q7O0FBRUQsVUFBUyw0QkFBNEIsQ0FBQyxNQUFNLEVBQWtCO01BQWhCLFFBQVEseURBQUMsS0FBSzs7YUFFMUQsV0ExRXVCLFNBQVMsRUEwRXRCLE9BMUV3QixRQUFRLENBMEV2QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQ3RDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLE9BNUVHLGFBQWEsQ0E0RUYsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUMxQyxRQUFRLElBQUksV0E1RVUsU0FBUyxFQTRFVCxPQTVFVyxRQUFRLENBNEVWLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsR0FDbEQsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsT0E5RUcsYUFBYSxDQThFRixLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQzFDLENBQUMsTUFBTSxFQUFFLE9BL0VVLGFBQWEsQ0ErRVQsS0FBSyxFQUFFLEtBQUssQ0FBQzs7OztRQUwvQixJQUFJO1FBQUUsSUFBSTtRQUFFLFFBQVE7O0FBTTNCLFFBQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUN4QyxRQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDekIsUUFBTSxNQUFNLEdBQUcsVUFoRlIsSUFBSSxFQWdGUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNO0FBQzNDLFNBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUMxQixnQkFyRk0sS0FBSyxFQXFGTCxXQW5GaUIsU0FBUyxFQW1GaEIsT0FuRmtCLFFBQVEsQ0FtRmpCLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEdBQUUsa0JBdEY5RCxJQUFJLEVBc0YrRCxHQUFHLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNoRixTQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDL0IsZUFuRk0sYUFBYSxFQW1GTCxVQUFVLEVBQUUsTUFBTSxDQUFDLHlCQUF5QixHQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQTtBQUNwRSxVQUFPLFdBbkZELFdBQVcsRUFtRkUsVUFBVSxDQUFDLENBQUE7R0FDOUIsQ0FBQyxDQUFBO0FBQ0YsUUFBTSxPQUFPLEdBQUcsV0F6RlQsWUFBWSxDQXlGYyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDaEUsU0FBTyxRQUFRLEdBQUcsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFDLEdBQUcsT0FBTyxDQUFBO0VBQy9DIiwiZmlsZSI6InByaXZhdGUvcGFyc2UvcGFyc2VMb2NhbERlY2xhcmVzLmpzIiwic291cmNlc0NvbnRlbnQiOltudWxsLCJpbXBvcnQge2NvZGV9IGZyb20gJy4uLy4uL0NvbXBpbGVFcnJvcidcbmltcG9ydCB7Y2hlY2t9IGZyb20gJy4uL2NvbnRleHQnXG5pbXBvcnQge0xvY2FsRGVjbGFyZSwgTG9jYWxEZWNsYXJlc30gZnJvbSAnLi4vTXNBc3QnXG5pbXBvcnQge0dyb3VwcywgaXNHcm91cCwgaXNLZXl3b3JkLCBLZXl3b3JkcywgTmFtZX0gZnJvbSAnLi4vVG9rZW4nXG5pbXBvcnQge29wSWZ9IGZyb20gJy4uL3V0aWwnXG5pbXBvcnQge2NoZWNrTm9uRW1wdHl9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtwYXJzZVNwYWNlZH0gZnJvbSAnLi9wYXJzZSonXG5pbXBvcnQgU2xpY2UgZnJvbSAnLi9TbGljZSdcblxuLyoqXG5QYXJzZSBsb2NhbHMgKGBhYCBvciBgYTpiYCkuXG5AcmV0dXJuIHtBcnJheTxMb2NhbERlY2xhcmU+fVxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcnNlTG9jYWxEZWNsYXJlcyh0b2tlbnMpIHtcblx0cmV0dXJuIHRva2Vucy5tYXAocGFyc2VMb2NhbERlY2xhcmUpXG59XG5cbi8qKlxuUGFyc2UgbG9jYWxzIHdpdGggbm8gdHlwZXMgYWxsb3dlZC5cbkByZXR1cm4ge0FycmF5PExvY2FsRGVjbGFyZT59XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyh0b2tlbnMpIHtcblx0cmV0dXJuIHRva2Vucy5tYXAoXyA9PiBMb2NhbERlY2xhcmUucGxhaW4oXy5sb2MsIHBhcnNlTG9jYWxOYW1lKF8pKSlcbn1cblxuLyoqIFBhcnNlIGEgc2luZ2xlIGxvY2FsIGRlY2xhcmUuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbERlY2xhcmUodG9rZW4pIHtcblx0cmV0dXJuIF9wYXJzZUxvY2FsRGVjbGFyZSh0b2tlbilcbn1cblxuLyoqIFBhcnNlIGEgc2luZ2xlIGxvY2FsIGRlY2xhcmUgZnJvbSB0aGUgdG9rZW5zIGluIGEge0BsaW5rIEdyb3Vwcy5TcGFjZX0uICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbERlY2xhcmVGcm9tU3BhY2VkKHRva2Vucykge1xuXHRyZXR1cm4gX3BhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZCh0b2tlbnMpXG59XG5cbi8qKlxuRm9yIGNvbnN0cnVjdG9yLiBQYXJzZSBsb2NhbCBkZWNsYXJlcyB3aGlsZSBhbGxvd2luZyBgLnhgLXN0eWxlIGFyZ3VtZW50cy5cbkByZXR1cm4ge3tkZWNsYXJlczogQXJyYXk8TG9jYWxEZWNsYXJlPiwgbWVtYmVyQXJnczogQXJyYXk8TG9jYWxEZWNsYXJlPn19XG5cdGBtZW1iZXJBcmdzYCBpcyAgYSBzdWJzZXQgb2YgYGRlY2xhcmVzYC5cbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMb2NhbERlY2xhcmVzQW5kTWVtYmVyQXJncyh0b2tlbnMpIHtcblx0Y29uc3QgZGVjbGFyZXMgPSBbXSwgbWVtYmVyQXJncyA9IFtdXG5cdGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG5cdFx0Y29uc3Qge2RlY2xhcmUsIGlzTWVtYmVyfSA9IF9wYXJzZUxvY2FsRGVjbGFyZSh0b2tlbiwgdHJ1ZSlcblx0XHRkZWNsYXJlcy5wdXNoKGRlY2xhcmUpXG5cdFx0aWYgKGlzTWVtYmVyKVxuXHRcdFx0bWVtYmVyQXJncy5wdXNoKGRlY2xhcmUpXG5cdH1cblx0cmV0dXJuIHtkZWNsYXJlcywgbWVtYmVyQXJnc31cbn1cblxuLyoqXG5QYXJzZSBhIG5hbWUgZm9yIGEgbG9jYWwgdmFyaWFibGUuXG5Vbmxpa2Uge0BsaW5rIHBhcnNlTmFtZX0sIGBfYCBpcyB0aGUgb25seSBhbGxvd2VkIEtleXdvcmQuXG5AcmV0dXJuIHtzdHJpbmd9XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTG9jYWxOYW1lKHRva2VuKSB7XG5cdGlmIChpc0tleXdvcmQoS2V5d29yZHMuRm9jdXMsIHRva2VuKSlcblx0XHRyZXR1cm4gJ18nXG5cdGVsc2Uge1xuXHRcdGNoZWNrKHRva2VuIGluc3RhbmNlb2YgTmFtZSwgdG9rZW4ubG9jLCAoKSA9PiBgRXhwZWN0ZWQgYSBsb2NhbCBuYW1lLCBub3QgJHt0b2tlbn0uYClcblx0XHRyZXR1cm4gdG9rZW4ubmFtZVxuXHR9XG59XG5cblxuZnVuY3Rpb24gX3BhcnNlTG9jYWxEZWNsYXJlKHRva2VuLCBvck1lbWJlcj1mYWxzZSkge1xuXHRpZiAoaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSlcblx0XHRyZXR1cm4gX3BhcnNlTG9jYWxEZWNsYXJlRnJvbVNwYWNlZChTbGljZS5ncm91cCh0b2tlbiksIG9yTWVtYmVyKVxuXHRlbHNlIHtcblx0XHRjb25zdCBkZWNsYXJlID0gTG9jYWxEZWNsYXJlLnBsYWluKHRva2VuLmxvYywgcGFyc2VMb2NhbE5hbWUodG9rZW4pKVxuXHRcdHJldHVybiBvck1lbWJlciA/IHtkZWNsYXJlLCBpc01lbWJlcjogZmFsc2V9IDogZGVjbGFyZVxuXHR9XG59XG5cbmZ1bmN0aW9uIF9wYXJzZUxvY2FsRGVjbGFyZUZyb21TcGFjZWQodG9rZW5zLCBvck1lbWJlcj1mYWxzZSkge1xuXHRjb25zdCBbcmVzdCwga2luZCwgaXNNZW1iZXJdID1cblx0XHRpc0tleXdvcmQoS2V5d29yZHMuTGF6eSwgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0W3Rva2Vucy50YWlsKCksIExvY2FsRGVjbGFyZXMuTGF6eSwgZmFsc2VdIDpcblx0XHRcdG9yTWVtYmVyICYmIGlzS2V5d29yZChLZXl3b3Jkcy5Eb3QsIHRva2Vucy5oZWFkKCkpID9cblx0XHRcdFt0b2tlbnMudGFpbCgpLCBMb2NhbERlY2xhcmVzLkNvbnN0LCB0cnVlXSA6XG5cdFx0XHRbdG9rZW5zLCBMb2NhbERlY2xhcmVzLkNvbnN0LCBmYWxzZV1cblx0Y29uc3QgbmFtZSA9IHBhcnNlTG9jYWxOYW1lKHJlc3QuaGVhZCgpKVxuXHRjb25zdCByZXN0MiA9IHJlc3QudGFpbCgpXG5cdGNvbnN0IG9wVHlwZSA9IG9wSWYoIXJlc3QyLmlzRW1wdHkoKSwgKCkgPT4ge1xuXHRcdGNvbnN0IGNvbG9uID0gcmVzdDIuaGVhZCgpXG5cdFx0Y2hlY2soaXNLZXl3b3JkKEtleXdvcmRzLlR5cGUsIGNvbG9uKSwgY29sb24ubG9jLCAoKSA9PiBgRXhwZWN0ZWQgJHtjb2RlKCc6Jyl9YClcblx0XHRjb25zdCB0b2tlbnNUeXBlID0gcmVzdDIudGFpbCgpXG5cdFx0Y2hlY2tOb25FbXB0eSh0b2tlbnNUeXBlLCAoKSA9PiBgRXhwZWN0ZWQgc29tZXRoaW5nIGFmdGVyICR7Y29sb259YClcblx0XHRyZXR1cm4gcGFyc2VTcGFjZWQodG9rZW5zVHlwZSlcblx0fSlcblx0Y29uc3QgZGVjbGFyZSA9IG5ldyBMb2NhbERlY2xhcmUodG9rZW5zLmxvYywgbmFtZSwgb3BUeXBlLCBraW5kKVxuXHRyZXR1cm4gb3JNZW1iZXIgPyB7ZGVjbGFyZSwgaXNNZW1iZXJ9IDogZGVjbGFyZVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc3JjIn0=
