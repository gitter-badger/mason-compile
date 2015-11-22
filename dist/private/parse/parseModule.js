'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../context', '../MsAst', '../Token', '../util', './checks', './parseBlock', './parseLine', './parseLocalDeclares', './parseName', './Slice', './tryTakeComment'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../context'), require('../MsAst'), require('../Token'), require('../util'), require('./checks'), require('./parseBlock'), require('./parseLine'), require('./parseLocalDeclares'), require('./parseName'), require('./Slice'), require('./tryTakeComment'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.context, global.MsAst, global.Token, global.util, global.checks, global.parseBlock, global.parseLine, global.parseLocalDeclares, global.parseName, global.Slice, global.tryTakeComment);
		global.parseModule = mod.exports;
	}
})(this, function (exports, _context, _MsAst, _Token, _util, _checks, _parseBlock, _parseLine, _parseLocalDeclares, _parseName, _Slice, _tryTakeComment3) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = parseModule;

	var _parseName2 = _interopRequireDefault(_parseName);

	var _Slice2 = _interopRequireDefault(_Slice);

	var _tryTakeComment4 = _interopRequireDefault(_tryTakeComment3);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	var _slicedToArray = (function () {
		function sliceIterator(arr, i) {
			var _arr = [];
			var _n = true;
			var _d = false;
			var _e = undefined;

			try {
				for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
					_arr.push(_s.value);

					if (i && _arr.length === i) break;
				}
			} catch (err) {
				_d = true;
				_e = err;
			} finally {
				try {
					if (!_n && _i["return"]) _i["return"]();
				} finally {
					if (_d) throw _e;
				}
			}

			return _arr;
		}

		return function (arr, i) {
			if (Array.isArray(arr)) {
				return arr;
			} else if (Symbol.iterator in Object(arr)) {
				return sliceIterator(arr, i);
			} else {
				throw new TypeError("Invalid attempt to destructure non-iterable instance");
			}
		};
	})();

	function parseModule(tokens) {
		var _tryTakeComment = (0, _tryTakeComment4.default)(tokens);

		var _tryTakeComment2 = _slicedToArray(_tryTakeComment, 2);

		const opComment = _tryTakeComment2[0];
		const rest0 = _tryTakeComment2[1];

		var _takeImports = takeImports(_Token.Keywords.ImportDo, rest0);

		var _takeImports2 = _slicedToArray(_takeImports, 2);

		const doImports = _takeImports2[0];
		const rest1 = _takeImports2[1];

		var _takeImports3 = takeImports(_Token.Keywords.Import, rest1);

		var _takeImports4 = _slicedToArray(_takeImports3, 2);

		const plainImports = _takeImports4[0];
		const rest2 = _takeImports4[1];

		var _takeImports5 = takeImports(_Token.Keywords.ImportLazy, rest2);

		var _takeImports6 = _slicedToArray(_takeImports5, 2);

		const lazyImports = _takeImports6[0];
		const rest3 = _takeImports6[1];
		const lines = (0, _parseLine.parseLines)(rest3);
		const imports = plainImports.concat(lazyImports);
		return new _MsAst.Module(tokens.loc, _context.options.moduleName(), opComment, doImports, imports, lines);
	}

	function takeImports(importKeywordKind, lines) {
		if (!lines.isEmpty()) {
			const line = lines.headSlice();
			if ((0, _Token.isKeyword)(importKeywordKind, line.head())) return [parseImports(importKeywordKind, line.tail()), lines.tail()];
		}

		return [[], lines];
	}

	function parseImports(importKeywordKind, tokens) {
		const lines = (0, _parseBlock.justBlock)(importKeywordKind, tokens);
		return lines.mapSlices(line => {
			var _parseRequire = parseRequire(line.head());

			const path = _parseRequire.path;
			const name = _parseRequire.name;
			const rest = line.tail();

			if (importKeywordKind === _Token.Keywords.ImportDo) {
				(0, _checks.checkEmpty)(rest, () => `This is an ${ (0, _Token.showKeyword)(_Token.Keywords.ImportDo) }, so you can't import any values.`);
				return new _MsAst.ImportDo(line.loc, path);
			} else {
				var _parseThingsImported = parseThingsImported(name, importKeywordKind === _Token.Keywords.ImportLazy, rest);

				const imported = _parseThingsImported.imported;
				const opImportDefault = _parseThingsImported.opImportDefault;
				return new _MsAst.Import(line.loc, path, imported, opImportDefault);
			}
		});
	}

	function parseThingsImported(name, isLazy, tokens) {
		const importDefault = () => _MsAst.LocalDeclare.untyped(tokens.loc, name, isLazy ? _MsAst.LocalDeclares.Lazy : _MsAst.LocalDeclares.Eager);

		if (tokens.isEmpty()) return {
			imported: [],
			opImportDefault: importDefault()
		};else {
			var _ref = (0, _Token.isKeyword)(_Token.Keywords.Focus, tokens.head()) ? [importDefault(), tokens.tail()] : [null, tokens];

			var _ref2 = _slicedToArray(_ref, 2);

			const opImportDefault = _ref2[0];
			const rest = _ref2[1];
			const imported = (0, _parseLocalDeclares.parseLocalDeclaresJustNames)(rest).map(l => {
				(0, _context.check)(l.name !== '_', l.pos, () => `${ (0, _Token.showKeyword)(_Token.Keywords.Focus) } not allowed as import name.`);
				if (isLazy) l.kind = _MsAst.LocalDeclares.Lazy;
				return l;
			});
			return {
				imported,
				opImportDefault
			};
		}
	}

	function parseRequire(token) {
		return (0, _util.ifElse)((0, _parseName.tryParseName)(token), name => ({
			path: name,
			name
		}), () => {
			(0, _context.check)((0, _Token.isGroup)(_Token.Groups.Space, token), token.loc, 'Not a valid module name.');

			const tokens = _Slice2.default.group(token);

			let rest = tokens;
			const parts = [];
			const head = rest.head();
			const n = tryTakeNDots(head);

			if (n !== null) {
				parts.push('.');

				for (let i = 1; i < n; i = i + 1) parts.push('..');

				rest = rest.tail();

				while (!rest.isEmpty()) {
					const n = tryTakeNDots(rest.head());
					if (n === null) break;

					for (let i = 0; i < n; i = i + 1) parts.push('..');

					rest = rest.tail();
				}
			}

			for (;;) {
				(0, _checks.checkNonEmpty)(rest);
				parts.push((0, _parseName2.default)(rest.head()));
				rest = rest.tail();
				if (rest.isEmpty()) break;
				(0, _checks.checkKeyword)(_Token.Keywords.Dot, rest.head());
				rest = rest.tail();
			}

			return {
				path: parts.join('/'),
				name: parts[parts.length - 1]
			};
		});
	}

	function tryTakeNDots(token) {
		if (!(token instanceof _Token.Keyword)) return null;

		switch (token.kind) {
			case _Token.Keywords.Dot:
				return 1;

			case _Token.Keywords.Dot2:
				return 2;

			case _Token.Keywords.Dot3:
				return 3;

			default:
				return null;
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3BhcnNlL3BhcnNlTW9kdWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFpQndCLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFBWCxXQUFXIiwiZmlsZSI6InBhcnNlTW9kdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjaGVjaywgb3B0aW9uc30gZnJvbSAnLi4vY29udGV4dCdcbmltcG9ydCB7SW1wb3J0RG8sIEltcG9ydCwgTG9jYWxEZWNsYXJlLCBMb2NhbERlY2xhcmVzLCBNb2R1bGV9IGZyb20gJy4uL01zQXN0J1xuaW1wb3J0IHtHcm91cHMsIGlzR3JvdXAsIGlzS2V5d29yZCwgS2V5d29yZCwgS2V5d29yZHMsIHNob3dLZXl3b3JkfSBmcm9tICcuLi9Ub2tlbidcbmltcG9ydCB7aWZFbHNlfSBmcm9tICcuLi91dGlsJ1xuaW1wb3J0IHtjaGVja0VtcHR5LCBjaGVja05vbkVtcHR5LCBjaGVja0tleXdvcmR9IGZyb20gJy4vY2hlY2tzJ1xuaW1wb3J0IHtqdXN0QmxvY2t9IGZyb20gJy4vcGFyc2VCbG9jaydcbmltcG9ydCB7cGFyc2VMaW5lc30gZnJvbSAnLi9wYXJzZUxpbmUnXG5pbXBvcnQge3BhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lc30gZnJvbSAnLi9wYXJzZUxvY2FsRGVjbGFyZXMnXG5pbXBvcnQgcGFyc2VOYW1lLCB7dHJ5UGFyc2VOYW1lfSBmcm9tICcuL3BhcnNlTmFtZSdcbmltcG9ydCBTbGljZSBmcm9tICcuL1NsaWNlJ1xuaW1wb3J0IHRyeVRha2VDb21tZW50IGZyb20gJy4vdHJ5VGFrZUNvbW1lbnQnXG5cbi8qKlxuUGFyc2UgdGhlIHdob2xlIFRva2VuIHRyZWUuXG5AcGFyYW0ge1NsaWNlfSB0b2tlbnNcbkByZXR1cm4ge01vZHVsZX1cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZU1vZHVsZSh0b2tlbnMpIHtcblx0Ly8gTW9kdWxlIGRvYyBjb21tZW50IG11c3QgY29tZSBmaXJzdC5cblx0Y29uc3QgW29wQ29tbWVudCwgcmVzdDBdID0gdHJ5VGFrZUNvbW1lbnQodG9rZW5zKVxuXHQvLyBJbXBvcnQgc3RhdGVtZW50cyBtdXN0IGFwcGVhciBpbiBvcmRlci5cblx0Y29uc3QgW2RvSW1wb3J0cywgcmVzdDFdID0gdGFrZUltcG9ydHMoS2V5d29yZHMuSW1wb3J0RG8sIHJlc3QwKVxuXHRjb25zdCBbcGxhaW5JbXBvcnRzLCByZXN0Ml0gPSB0YWtlSW1wb3J0cyhLZXl3b3Jkcy5JbXBvcnQsIHJlc3QxKVxuXHRjb25zdCBbbGF6eUltcG9ydHMsIHJlc3QzXSA9IHRha2VJbXBvcnRzKEtleXdvcmRzLkltcG9ydExhenksIHJlc3QyKVxuXHRjb25zdCBsaW5lcyA9IHBhcnNlTGluZXMocmVzdDMpXG5cdGNvbnN0IGltcG9ydHMgPSBwbGFpbkltcG9ydHMuY29uY2F0KGxhenlJbXBvcnRzKVxuXHRyZXR1cm4gbmV3IE1vZHVsZSh0b2tlbnMubG9jLCBvcHRpb25zLm1vZHVsZU5hbWUoKSwgb3BDb21tZW50LCBkb0ltcG9ydHMsIGltcG9ydHMsIGxpbmVzKVxufVxuXG5mdW5jdGlvbiB0YWtlSW1wb3J0cyhpbXBvcnRLZXl3b3JkS2luZCwgbGluZXMpIHtcblx0aWYgKCFsaW5lcy5pc0VtcHR5KCkpIHtcblx0XHRjb25zdCBsaW5lID0gbGluZXMuaGVhZFNsaWNlKClcblx0XHRpZiAoaXNLZXl3b3JkKGltcG9ydEtleXdvcmRLaW5kLCBsaW5lLmhlYWQoKSkpXG5cdFx0XHRyZXR1cm4gW3BhcnNlSW1wb3J0cyhpbXBvcnRLZXl3b3JkS2luZCwgbGluZS50YWlsKCkpLCBsaW5lcy50YWlsKCldXG5cdH1cblx0cmV0dXJuIFtbXSwgbGluZXNdXG59XG5cbmZ1bmN0aW9uIHBhcnNlSW1wb3J0cyhpbXBvcnRLZXl3b3JkS2luZCwgdG9rZW5zKSB7XG5cdGNvbnN0IGxpbmVzID0ganVzdEJsb2NrKGltcG9ydEtleXdvcmRLaW5kLCB0b2tlbnMpXG5cdHJldHVybiBsaW5lcy5tYXBTbGljZXMobGluZSA9PiB7XG5cdFx0Y29uc3Qge3BhdGgsIG5hbWV9ID0gcGFyc2VSZXF1aXJlKGxpbmUuaGVhZCgpKVxuXHRcdGNvbnN0IHJlc3QgPSBsaW5lLnRhaWwoKVxuXHRcdGlmIChpbXBvcnRLZXl3b3JkS2luZCA9PT0gS2V5d29yZHMuSW1wb3J0RG8pIHtcblx0XHRcdGNoZWNrRW1wdHkocmVzdCwgKCkgPT5cblx0XHRcdFx0YFRoaXMgaXMgYW4gJHtzaG93S2V5d29yZChLZXl3b3Jkcy5JbXBvcnREbyl9LCBzbyB5b3UgY2FuJ3QgaW1wb3J0IGFueSB2YWx1ZXMuYClcblx0XHRcdHJldHVybiBuZXcgSW1wb3J0RG8obGluZS5sb2MsIHBhdGgpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHtpbXBvcnRlZCwgb3BJbXBvcnREZWZhdWx0fSA9XG5cdFx0XHRcdHBhcnNlVGhpbmdzSW1wb3J0ZWQobmFtZSwgaW1wb3J0S2V5d29yZEtpbmQgPT09IEtleXdvcmRzLkltcG9ydExhenksIHJlc3QpXG5cdFx0XHRyZXR1cm4gbmV3IEltcG9ydChsaW5lLmxvYywgcGF0aCwgaW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdClcblx0XHR9XG5cdH0pXG59XG5cbmZ1bmN0aW9uIHBhcnNlVGhpbmdzSW1wb3J0ZWQobmFtZSwgaXNMYXp5LCB0b2tlbnMpIHtcblx0Y29uc3QgaW1wb3J0RGVmYXVsdCA9ICgpID0+XG5cdFx0TG9jYWxEZWNsYXJlLnVudHlwZWQoXG5cdFx0XHR0b2tlbnMubG9jLFxuXHRcdFx0bmFtZSxcblx0XHRcdGlzTGF6eSA/IExvY2FsRGVjbGFyZXMuTGF6eSA6IExvY2FsRGVjbGFyZXMuRWFnZXIpXG5cblx0aWYgKHRva2Vucy5pc0VtcHR5KCkpXG5cdFx0cmV0dXJuIHtpbXBvcnRlZDogW10sIG9wSW1wb3J0RGVmYXVsdDogaW1wb3J0RGVmYXVsdCgpfVxuXHRlbHNlIHtcblx0XHRjb25zdCBbb3BJbXBvcnREZWZhdWx0LCByZXN0XSA9IGlzS2V5d29yZChLZXl3b3Jkcy5Gb2N1cywgdG9rZW5zLmhlYWQoKSkgP1xuXHRcdFx0W2ltcG9ydERlZmF1bHQoKSwgdG9rZW5zLnRhaWwoKV0gOlxuXHRcdFx0W251bGwsIHRva2Vuc11cblx0XHRjb25zdCBpbXBvcnRlZCA9IHBhcnNlTG9jYWxEZWNsYXJlc0p1c3ROYW1lcyhyZXN0KS5tYXAobCA9PiB7XG5cdFx0XHRjaGVjayhsLm5hbWUgIT09ICdfJywgbC5wb3MsICgpID0+XG5cdFx0XHRcdGAke3Nob3dLZXl3b3JkKEtleXdvcmRzLkZvY3VzKX0gbm90IGFsbG93ZWQgYXMgaW1wb3J0IG5hbWUuYClcblx0XHRcdGlmIChpc0xhenkpXG5cdFx0XHRcdGwua2luZCA9IExvY2FsRGVjbGFyZXMuTGF6eVxuXHRcdFx0cmV0dXJuIGxcblx0XHR9KVxuXHRcdHJldHVybiB7aW1wb3J0ZWQsIG9wSW1wb3J0RGVmYXVsdH1cblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZVJlcXVpcmUodG9rZW4pIHtcblx0cmV0dXJuIGlmRWxzZSh0cnlQYXJzZU5hbWUodG9rZW4pLFxuXHRcdG5hbWUgPT4gKHtwYXRoOiBuYW1lLCBuYW1lfSksXG5cdFx0KCkgPT4ge1xuXHRcdFx0Y2hlY2soaXNHcm91cChHcm91cHMuU3BhY2UsIHRva2VuKSwgdG9rZW4ubG9jLCAnTm90IGEgdmFsaWQgbW9kdWxlIG5hbWUuJylcblx0XHRcdGNvbnN0IHRva2VucyA9IFNsaWNlLmdyb3VwKHRva2VuKVxuXG5cdFx0XHQvLyBUYWtlIGxlYWRpbmcgZG90cy5cblx0XHRcdGxldCByZXN0ID0gdG9rZW5zXG5cdFx0XHRjb25zdCBwYXJ0cyA9IFtdXG5cdFx0XHRjb25zdCBoZWFkID0gcmVzdC5oZWFkKClcblx0XHRcdGNvbnN0IG4gPSB0cnlUYWtlTkRvdHMoaGVhZClcblx0XHRcdGlmIChuICE9PSBudWxsKSB7XG5cdFx0XHRcdHBhcnRzLnB1c2goJy4nKVxuXHRcdFx0XHRmb3IgKGxldCBpID0gMTsgaSA8IG47IGkgPSBpICsgMSlcblx0XHRcdFx0XHRwYXJ0cy5wdXNoKCcuLicpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXHRcdFx0XHR3aGlsZSAoIXJlc3QuaXNFbXB0eSgpKSB7XG5cdFx0XHRcdFx0Y29uc3QgbiA9IHRyeVRha2VORG90cyhyZXN0LmhlYWQoKSlcblx0XHRcdFx0XHRpZiAobiA9PT0gbnVsbClcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpID0gaSArIDEpXG5cdFx0XHRcdFx0XHRwYXJ0cy5wdXNoKCcuLicpXG5cdFx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gVGFrZSBuYW1lLCB0aGVuIGFueSBudW1iZXIgb2YgZG90LXRoZW4tbmFtZSAoYC54YClcblx0XHRcdGZvciAoOzspIHtcblx0XHRcdFx0Y2hlY2tOb25FbXB0eShyZXN0KVxuXHRcdFx0XHRwYXJ0cy5wdXNoKHBhcnNlTmFtZShyZXN0LmhlYWQoKSkpXG5cdFx0XHRcdHJlc3QgPSByZXN0LnRhaWwoKVxuXG5cdFx0XHRcdGlmIChyZXN0LmlzRW1wdHkoKSlcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdC8vIElmIHRoZXJlJ3Mgc29tZXRoaW5nIGxlZnQsIGl0IHNob3VsZCBiZSBhIGRvdCwgZm9sbG93ZWQgYnkgYSBuYW1lLlxuXHRcdFx0XHRjaGVja0tleXdvcmQoS2V5d29yZHMuRG90LCByZXN0LmhlYWQoKSlcblx0XHRcdFx0cmVzdCA9IHJlc3QudGFpbCgpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7cGF0aDogcGFydHMuam9pbignLycpLCBuYW1lOiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXX1cblx0XHR9KVxufVxuXG5mdW5jdGlvbiB0cnlUYWtlTkRvdHModG9rZW4pIHtcblx0aWYgKCEodG9rZW4gaW5zdGFuY2VvZiBLZXl3b3JkKSlcblx0XHRyZXR1cm4gbnVsbFxuXHRzd2l0Y2ggKHRva2VuLmtpbmQpIHtcblx0XHRjYXNlIEtleXdvcmRzLkRvdDpcblx0XHRcdHJldHVybiAxXG5cdFx0Y2FzZSBLZXl3b3Jkcy5Eb3QyOlxuXHRcdFx0cmV0dXJuIDJcblx0XHRjYXNlIEtleXdvcmRzLkRvdDM6XG5cdFx0XHRyZXR1cm4gM1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHR9XG59XG4iXX0=