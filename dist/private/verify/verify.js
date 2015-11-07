'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', '../../CompileError', '../context', '../MsAst', '../util', './context', './locals', './util', './verifyLines'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('../../CompileError'), require('../context'), require('../MsAst'), require('../util'), require('./context'), require('./locals'), require('./util'), require('./verifyLines'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.CompileError, global.context, global.MsAst, global.util, global.context, global.locals, global.util, global.verifyLines);
		global.verify = mod.exports;
	}
})(this, function (exports, _CompileError, _context, _MsAst, _util, _context2, _locals, _util2, _verifyLines) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = verify;

	var MsAstTypes = _interopRequireWildcard(_MsAst);

	var _verifyLines2 = _interopRequireDefault(_verifyLines);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function verify(msAst) {
		(0, _context2.setup)();
		msAst.verify();
		(0, _locals.warnUnusedLocals)();
		const res = _context2.results;
		(0, _context2.tearDown)();
		return res;
	}

	(0, _util.implementMany)(MsAstTypes, 'verify', {
		Assert() {
			this.condition.verify();
			(0, _util2.verifyOp)(this.opThrown);
		},

		AssignSingle() {
			(0, _context2.withName)(this.assignee.name, () => {
				const doV = () => {
					if (this.value instanceof _MsAst.Class || this.value instanceof _MsAst.Fun || this.value instanceof _MsAst.Method || this.value instanceof _MsAst.Kind) (0, _util2.setName)(this.value);
					this.assignee.verify();
					this.value.verify();
				};

				if (this.assignee.isLazy()) (0, _locals.withBlockLocals)(doV);else doV();
			});
		},

		AssignDestructure() {
			for (const _ of this.assignees) _.verify();

			this.value.verify();
		},

		BagEntry: verifyBagEntry,
		BagEntryMany: verifyBagEntry,

		BagSimple() {
			for (const _ of this.parts) _.verify();
		},

		BlockDo() {
			(0, _verifyLines2.default)(this.lines);
		},

		BlockValThrow() {
			const newLocals = (0, _verifyLines2.default)(this.lines);
			(0, _locals.plusLocals)(newLocals, () => this.throw.verify());
		},

		BlockValReturn() {
			const newLocals = (0, _verifyLines2.default)(this.lines);
			(0, _locals.plusLocals)(newLocals, () => this.returned.verify());
		},

		BlockObj: verifyBlockBuild,
		BlockBag: verifyBlockBuild,
		BlockMap: verifyBlockBuild,

		BlockWrap() {
			(0, _context2.withIife)(() => this.block.verify());
		},

		Break() {
			verifyInLoop(this);
			(0, _context.check)(!_context2.opLoop.isVal, this.loc, () => `${ (0, _CompileError.code)('for') } in expression position must break with a value.`);
		},

		BreakWithVal() {
			verifyInLoop(this);
			(0, _context.check)(_context2.opLoop.isVal, this.loc, () => `${ (0, _CompileError.code)('break') } only valid inside ${ (0, _CompileError.code)('for') } in expression position.`);
			this.value.verify();
		},

		Call() {
			this.called.verify();

			for (const _ of this.args) _.verify();
		},

		Case() {
			(0, _context2.withIifeIf)(this.isVal, () => {
				const doIt = () => {
					for (const part of this.parts) part.verify();

					(0, _util2.verifyOp)(this.opElse);
				};

				(0, _util.ifElse)(this.opCased, _ => {
					_.verify();

					(0, _locals.verifyAndPlusLocal)(_.assignee, doIt);
				}, doIt);
			});
		},

		CasePart() {
			if (this.test instanceof _MsAst.Pattern) {
				this.test.type.verify();
				this.test.patterned.verify();
				(0, _locals.verifyAndPlusLocals)(this.test.locals, () => this.result.verify());
			} else {
				this.test.verify();
				this.result.verify();
			}
		},

		Catch() {
			(0, _context.check)(this.caught.opType === null, this.caught.loc, 'TODO: Caught types');
			(0, _locals.verifyAndPlusLocal)(this.caught, () => this.block.verify());
		},

		Class() {
			(0, _util2.verifyOp)(this.opSuperClass);

			for (const _ of this.kinds) _.verify();

			(0, _util2.verifyOp)(this.opDo);

			for (const _ of this.statics) _.verify();

			if (this.opConstructor !== null) this.opConstructor.verify(this.opSuperClass !== null);

			for (const _ of this.methods) _.verify();
		},

		ClassKindDo() {
			(0, _locals.verifyAndPlusLocal)(this.declareFocus, () => this.block.verify());
		},

		Cond() {
			this.test.verify();
			this.ifTrue.verify();
			this.ifFalse.verify();
		},

		Conditional() {
			this.test.verify();
			(0, _context2.withIifeIf)(this.isVal, () => this.result.verify());
		},

		Constructor(classHasSuper) {
			_context2.okToNotUse.add(this.fun.opDeclareThis);

			(0, _context2.withMethod)(this, () => {
				this.fun.verify();
			});

			const superCall = _context2.results.constructorToSuper.get(this);

			if (classHasSuper) (0, _context.check)(superCall !== undefined, this.loc, () => `Constructor must contain ${ (0, _CompileError.code)('super!') }`);else (0, _context.check)(superCall === undefined, () => superCall.loc, () => `Class has no superclass, so ${ (0, _CompileError.code)('super!') } is not allowed.`);

			for (const _ of this.memberArgs) (0, _locals.setDeclareAccessed)(_, this);
		},

		Except() {
			this.try.verify();
			(0, _util2.verifyOp)(this.catch);
			(0, _util2.verifyOp)(this.finally);
		},

		ForBag() {
			(0, _locals.verifyAndPlusLocal)(this.built, () => verifyFor(this));
		},

		For() {
			verifyFor(this);
		},

		Fun() {
			if (this.opReturnType !== null) {
				(0, _context.check)(this.block instanceof _MsAst.BlockVal, this.loc, 'Function with return type must return something.');
				if (this.block instanceof _MsAst.BlockValThrow) (0, _context.warn)('Return type ignored because the block always throws.');
			}

			(0, _locals.withBlockLocals)(() => {
				(0, _context2.withInFunKind)(this.kind, () => (0, _context2.withLoop)(null, () => {
					const allArgs = (0, _util.cat)(this.opDeclareThis, this.args, this.opRestArg);
					(0, _locals.verifyAndPlusLocals)(allArgs, () => {
						this.block.verify();
						(0, _util2.verifyOp)(this.opReturnType);
					});
				}));
			});
		},

		FunAbstract() {
			for (const _ of this.args) _.verify();

			(0, _util2.verifyOp)(this.opRestArg);
			(0, _util2.verifyOp)(this.opReturnType);
		},

		Ignore() {
			for (const _ of this.ignoredNames) (0, _locals.accessLocal)(this, _);
		},

		Kind() {
			for (const _ of this.superKinds) _.verify();

			(0, _util2.verifyOp)(this.opDo);

			for (const _ of this.statics) _.verify();

			for (const _ of this.methods) _.verify();
		},

		Lazy() {
			(0, _locals.withBlockLocals)(() => this.value.verify());
		},

		LocalAccess() {
			const declare = _context2.locals.get(this.name);

			if (declare === undefined) {
				const builtinPath = _context.options.builtinNameToPath.get(this.name);

				if (builtinPath === undefined) (0, _locals.failMissingLocal)(this.loc, this.name);else {
					const names = _context2.results.builtinPathToNames.get(builtinPath);

					if (names === undefined) _context2.results.builtinPathToNames.set(builtinPath, new Set([this.name]));else names.add(this.name);
				}
			} else {
				_context2.results.localAccessToDeclare.set(this, declare);

				(0, _locals.setDeclareAccessed)(declare, this);
			}
		},

		LocalDeclare() {
			const builtinPath = _context.options.builtinNameToPath.get(this.name);

			if (builtinPath !== undefined) (0, _context.warn)(this.loc, `Local ${ (0, _CompileError.code)(this.name) } overrides builtin from ${ (0, _CompileError.code)(builtinPath) }.`);
			(0, _util2.verifyOp)(this.opType);
		},

		LocalMutate() {
			const declare = (0, _locals.getLocalDeclare)(this.name, this.loc);
			(0, _context.check)(declare.isMutable(), this.loc, () => `${ (0, _CompileError.code)(this.name) } is not mutable.`);
			this.value.verify();
		},

		Logic() {
			(0, _context.check)(this.args.length > 1, 'Logic expression needs at least 2 arguments.');

			for (const _ of this.args) _.verify();
		},

		Not() {
			this.arg.verify();
		},

		NumberLiteral() {},

		MapEntry() {
			(0, _locals.accessLocal)(this, 'built');
			this.key.verify();
			this.val.verify();
		},

		Member() {
			this.object.verify();
			(0, _util2.verifyName)(this.name);
		},

		MemberFun() {
			(0, _util2.verifyOp)(this.opObject);
			(0, _util2.verifyName)(this.name);
		},

		MemberSet() {
			this.object.verify();
			(0, _util2.verifyName)(this.name);
			(0, _util2.verifyOp)(this.opType);
			this.value.verify();
		},

		Method() {
			_context2.okToNotUse.add(this.fun.opDeclareThis);

			for (const _ of this.fun.args) _context2.okToNotUse.add(_);

			(0, _util.opEach)(this.fun.opRestArg, _ => _context2.okToNotUse.add(_));
			this.fun.verify();
		},

		MethodImpl() {
			verifyMethodImpl(this, () => {
				_context2.okToNotUse.add(this.fun.opDeclareThis);

				this.fun.verify();
			});
		},

		MethodGetter() {
			verifyMethodImpl(this, () => {
				_context2.okToNotUse.add(this.declareThis);

				(0, _locals.verifyAndPlusLocals)([this.declareThis], () => {
					this.block.verify();
				});
			});
		},

		MethodSetter() {
			verifyMethodImpl(this, () => {
				(0, _locals.verifyAndPlusLocals)([this.declareThis, this.declareFocus], () => {
					this.block.verify();
				});
			});
		},

		Module() {
			for (const _ of this.imports) _.verify();

			(0, _util2.verifyOp)(this.opImportGlobal);
			(0, _context2.withName)(_context.options.moduleName(), () => {
				(0, _verifyLines2.default)(this.lines);
			});
		},

		ModuleExport() {
			this.assign.verify();

			for (const _ of this.assign.allAssignees()) (0, _locals.setDeclareAccessed)(_, this);
		},

		New() {
			this.type.verify();

			for (const _ of this.args) _.verify();
		},

		ObjEntryAssign() {
			(0, _locals.accessLocal)(this, 'built');
			this.assign.verify();

			for (const _ of this.assign.allAssignees()) (0, _locals.setDeclareAccessed)(_, this);
		},

		ObjEntryPlain() {
			(0, _locals.accessLocal)(this, 'built');
			(0, _util2.verifyName)(this.name);
			this.value.verify();
		},

		ObjSimple() {
			const keys = new Set();

			for (const pair of this.pairs) {
				const key = pair.key;
				const value = pair.value;
				(0, _context.check)(!keys.has(key), pair.loc, () => `Duplicate key ${ key }`);
				keys.add(key);
				value.verify();
			}
		},

		GetterFun() {
			(0, _util2.verifyName)(this.name);
		},

		QuotePlain() {
			for (const _ of this.parts) (0, _util2.verifyName)(_);
		},

		QuoteSimple() {},

		QuoteTaggedTemplate() {
			this.tag.verify();
			this.quote.verify();
		},

		Range() {
			this.start.verify();
			(0, _util2.verifyOp)(this.end);
		},

		SetSub() {
			this.object.verify();

			for (const _ of this.subbeds) _.verify();

			(0, _util2.verifyOp)(this.opType);
			this.value.verify();
		},

		SpecialDo() {},

		SpecialVal() {
			(0, _util2.setName)(this);
		},

		Spread() {
			this.spreaded.verify();
		},

		SuperCall() {
			(0, _context.check)(_context2.method !== null, this.loc, 'Must be in a method.');

			_context2.results.superCallToMethod.set(this, _context2.method);

			if (_context2.method instanceof _MsAst.Constructor) {
				(0, _context.check)(!this.isVal, this.loc, () => `${ (0, _CompileError.code)('super') } in constructor must appear as a statement.'`);

				_context2.results.constructorToSuper.set(_context2.method, this);
			}

			for (const _ of this.args) _.verify();
		},

		SuperMember() {
			(0, _context.check)(_context2.method !== null, this.loc, 'Must be in method.');
			(0, _util2.verifyName)(this.name);
		},

		Switch() {
			(0, _context2.withIifeIf)(this.isVal, () => {
				this.switched.verify();

				for (const part of this.parts) part.verify();

				(0, _util2.verifyOp)(this.opElse);
			});
		},

		SwitchPart() {
			for (const _ of this.values) _.verify();

			this.result.verify();
		},

		Throw() {
			(0, _util2.verifyOp)(this.opThrown);
		},

		Import: verifyImport,
		ImportGlobal: verifyImport,

		With() {
			this.value.verify();
			(0, _context2.withIife)(() => {
				if (this.declare.name === '_') _context2.okToNotUse.add(this.declare);
				(0, _locals.verifyAndPlusLocal)(this.declare, () => {
					this.block.verify();
				});
			});
		},

		Yield() {
			(0, _context.check)(_context2.funKind !== _MsAst.Funs.Plain, `Cannot ${ (0, _CompileError.code)('<~') } outside of async/generator.`);
			if (_context2.funKind === _MsAst.Funs.Async) (0, _context.check)(this.opYielded !== null, this.loc, 'Cannot await nothing.');
			(0, _util2.verifyOp)(this.opYielded);
		},

		YieldTo() {
			(0, _context.check)(_context2.funKind === _MsAst.Funs.Generator, this.loc, `Cannot ${ (0, _CompileError.code)('<~~') } outside of generator.`);
			this.yieldedTo.verify();
		}

	});

	function verifyBagEntry() {
		(0, _locals.accessLocal)(this, 'built');
		this.value.verify();
	}

	function verifyBlockBuild() {
		(0, _locals.verifyAndPlusLocal)(this.built, () => {
			(0, _verifyLines2.default)(this.lines);
		});
	}

	function verifyImport() {
		const addUseLocal = _ => {
			const prev = _context2.locals.get(_.name);

			(0, _context.check)(prev === undefined, _.loc, () => `${ (0, _CompileError.code)(_.name) } already imported at ${ prev.loc }`);
			(0, _locals.verifyLocalDeclare)(_);
			(0, _locals.setLocal)(_);
		};

		for (const _ of this.imported) addUseLocal(_);

		(0, _util.opEach)(this.opImportDefault, addUseLocal);
	}

	function verifyFor(forLoop) {
		const verifyBlock = () => (0, _context2.withLoop)(forLoop, () => forLoop.block.verify());

		(0, _util.ifElse)(forLoop.opIteratee, _ref => {
			let element = _ref.element;
			let bag = _ref.bag;
			bag.verify();
			(0, _locals.verifyAndPlusLocal)(element, verifyBlock);
		}, verifyBlock);
	}

	function verifyInLoop(loopUser) {
		(0, _context.check)(_context2.opLoop !== null, loopUser.loc, 'Not in a loop.');
	}

	function verifyMethodImpl(_, doVerify) {
		(0, _util2.verifyName)(_.symbol);
		(0, _context2.withMethod)(_, doVerify);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcml2YXRlL3ZlcmlmeS92ZXJpZnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQW1Cd0IsTUFBTTs7Ozs7Ozs7OztVQUFOLE1BQU0iLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjb2RlfSBmcm9tICcuLi8uLi9Db21waWxlRXJyb3InXG5pbXBvcnQge2NoZWNrLCBvcHRpb25zLCB3YXJufSBmcm9tICcuLi9jb250ZXh0J1xuaW1wb3J0ICogYXMgTXNBc3RUeXBlcyBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7QmxvY2tWYWwsIEJsb2NrVmFsVGhyb3csIENsYXNzLCBDb25zdHJ1Y3RvciwgRnVuLCBGdW5zLCBLaW5kLCBNZXRob2QsIFBhdHRlcm5cblx0fSBmcm9tICcuLi9Nc0FzdCdcbmltcG9ydCB7Y2F0LCBpZkVsc2UsIGltcGxlbWVudE1hbnksIG9wRWFjaH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7ZnVuS2luZCwgbG9jYWxzLCBtZXRob2QsIG9rVG9Ob3RVc2UsIG9wTG9vcCwgcmVzdWx0cywgc2V0dXAsIHRlYXJEb3duLCB3aXRoSWlmZSwgd2l0aElpZmVJZixcblx0d2l0aEluRnVuS2luZCwgd2l0aE1ldGhvZCwgd2l0aExvb3AsIHdpdGhOYW1lfSBmcm9tICcuL2NvbnRleHQnXG5pbXBvcnQge2FjY2Vzc0xvY2FsLCBnZXRMb2NhbERlY2xhcmUsIGZhaWxNaXNzaW5nTG9jYWwsIHBsdXNMb2NhbHMsIHNldERlY2xhcmVBY2Nlc3NlZCwgc2V0TG9jYWwsXG5cdHZlcmlmeUFuZFBsdXNMb2NhbCwgdmVyaWZ5QW5kUGx1c0xvY2FscywgdmVyaWZ5TG9jYWxEZWNsYXJlLCB3YXJuVW51c2VkTG9jYWxzLCB3aXRoQmxvY2tMb2NhbHNcblx0fSBmcm9tICcuL2xvY2FscydcbmltcG9ydCB7c2V0TmFtZSwgdmVyaWZ5TmFtZSwgdmVyaWZ5T3B9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB2ZXJpZnlMaW5lcyBmcm9tICcuL3ZlcmlmeUxpbmVzJ1xuXG4vKipcbkdlbmVyYXRlcyBpbmZvcm1hdGlvbiBuZWVkZWQgZHVyaW5nIHRyYW5zcGlsaW5nLCB0aGUgVmVyaWZ5UmVzdWx0cy5cbkFsc28gY2hlY2tzIGZvciBleGlzdGVuY2Ugb2YgbG9jYWwgdmFyaWFibGVzIGFuZCB3YXJucyBmb3IgdW51c2VkIGxvY2Fscy5cbkBwYXJhbSB7TXNBc3R9IG1zQXN0XG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmVyaWZ5KG1zQXN0KSB7XG5cdHNldHVwKClcblx0bXNBc3QudmVyaWZ5KClcblx0d2FyblVudXNlZExvY2FscygpXG5cdGNvbnN0IHJlcyA9IHJlc3VsdHNcblx0dGVhckRvd24oKVxuXHRyZXR1cm4gcmVzXG59XG5cbmltcGxlbWVudE1hbnkoTXNBc3RUeXBlcywgJ3ZlcmlmeScsIHtcblx0QXNzZXJ0KCkge1xuXHRcdHRoaXMuY29uZGl0aW9uLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93bilcblx0fSxcblxuXHRBc3NpZ25TaW5nbGUoKSB7XG5cdFx0d2l0aE5hbWUodGhpcy5hc3NpZ25lZS5uYW1lLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBkb1YgPSAoKSA9PiB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdEZ1biBhbmQgQ2xhc3Mgb25seSBnZXQgbmFtZSBpZiB0aGV5IGFyZSBpbW1lZGlhdGVseSBhZnRlciB0aGUgYXNzaWdubWVudC5cblx0XHRcdFx0c28gaW4gYHggPSAkYWZ0ZXItdGltZSAxMDAwIHxgIHRoZSBmdW5jdGlvbiBpcyBub3QgbmFtZWQuXG5cdFx0XHRcdCovXG5cdFx0XHRcdGlmICh0aGlzLnZhbHVlIGluc3RhbmNlb2YgQ2xhc3MgfHxcblx0XHRcdFx0XHR0aGlzLnZhbHVlIGluc3RhbmNlb2YgRnVuIHx8XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSBpbnN0YW5jZW9mIE1ldGhvZCB8fFxuXHRcdFx0XHRcdHRoaXMudmFsdWUgaW5zdGFuY2VvZiBLaW5kKVxuXHRcdFx0XHRcdHNldE5hbWUodGhpcy52YWx1ZSlcblxuXHRcdFx0XHQvLyBBc3NpZ25lZSByZWdpc3RlcmVkIGJ5IHZlcmlmeUxpbmVzLlxuXHRcdFx0XHR0aGlzLmFzc2lnbmVlLnZlcmlmeSgpXG5cdFx0XHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLmFzc2lnbmVlLmlzTGF6eSgpKVxuXHRcdFx0XHR3aXRoQmxvY2tMb2NhbHMoZG9WKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRkb1YoKVxuXHRcdH0pXG5cdH0sXG5cblx0QXNzaWduRGVzdHJ1Y3R1cmUoKSB7XG5cdFx0Ly8gQXNzaWduZWVzIHJlZ2lzdGVyZWQgYnkgdmVyaWZ5TGluZXMuXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXNzaWduZWVzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRCYWdFbnRyeTogdmVyaWZ5QmFnRW50cnksXG5cdEJhZ0VudHJ5TWFueTogdmVyaWZ5QmFnRW50cnksXG5cblx0QmFnU2ltcGxlKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdEJsb2NrRG8oKSB7XG5cdFx0dmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0fSxcblxuXHRCbG9ja1ZhbFRocm93KCkge1xuXHRcdGNvbnN0IG5ld0xvY2FscyA9IHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdFx0cGx1c0xvY2FscyhuZXdMb2NhbHMsICgpID0+IHRoaXMudGhyb3cudmVyaWZ5KCkpXG5cdH0sXG5cblx0QmxvY2tWYWxSZXR1cm4oKSB7XG5cdFx0Y29uc3QgbmV3TG9jYWxzID0gdmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHRwbHVzTG9jYWxzKG5ld0xvY2FscywgKCkgPT4gdGhpcy5yZXR1cm5lZC52ZXJpZnkoKSlcblx0fSxcblxuXG5cdEJsb2NrT2JqOiB2ZXJpZnlCbG9ja0J1aWxkLFxuXHRCbG9ja0JhZzogdmVyaWZ5QmxvY2tCdWlsZCxcblx0QmxvY2tNYXA6IHZlcmlmeUJsb2NrQnVpbGQsXG5cblx0QmxvY2tXcmFwKCkge1xuXHRcdHdpdGhJaWZlKCgpID0+IHRoaXMuYmxvY2sudmVyaWZ5KCkpXG5cdH0sXG5cblx0QnJlYWsoKSB7XG5cdFx0dmVyaWZ5SW5Mb29wKHRoaXMpXG5cdFx0Y2hlY2soIW9wTG9vcC5pc1ZhbCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKCdmb3InKX0gaW4gZXhwcmVzc2lvbiBwb3NpdGlvbiBtdXN0IGJyZWFrIHdpdGggYSB2YWx1ZS5gKVxuXHR9LFxuXG5cdEJyZWFrV2l0aFZhbCgpIHtcblx0XHR2ZXJpZnlJbkxvb3AodGhpcylcblx0XHRjaGVjayhvcExvb3AuaXNWYWwsIHRoaXMubG9jLCAoKSA9PlxuXHRcdFx0YCR7Y29kZSgnYnJlYWsnKX0gb25seSB2YWxpZCBpbnNpZGUgJHtjb2RlKCdmb3InKX0gaW4gZXhwcmVzc2lvbiBwb3NpdGlvbi5gKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRDYWxsKCkge1xuXHRcdHRoaXMuY2FsbGVkLnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHRDYXNlKCkge1xuXHRcdHdpdGhJaWZlSWYodGhpcy5pc1ZhbCwgKCkgPT4ge1xuXHRcdFx0Y29uc3QgZG9JdCA9ICgpID0+IHtcblx0XHRcdFx0Zm9yIChjb25zdCBwYXJ0IG9mIHRoaXMucGFydHMpXG5cdFx0XHRcdFx0cGFydC52ZXJpZnkoKVxuXHRcdFx0XHR2ZXJpZnlPcCh0aGlzLm9wRWxzZSlcblx0XHRcdH1cblx0XHRcdGlmRWxzZSh0aGlzLm9wQ2FzZWQsXG5cdFx0XHRcdF8gPT4ge1xuXHRcdFx0XHRcdF8udmVyaWZ5KClcblx0XHRcdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWwoXy5hc3NpZ25lZSwgZG9JdClcblx0XHRcdFx0fSxcblx0XHRcdFx0ZG9JdClcblx0XHR9KVxuXHR9LFxuXG5cdENhc2VQYXJ0KCkge1xuXHRcdGlmICh0aGlzLnRlc3QgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XG5cdFx0XHR0aGlzLnRlc3QudHlwZS52ZXJpZnkoKVxuXHRcdFx0dGhpcy50ZXN0LnBhdHRlcm5lZC52ZXJpZnkoKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2Fscyh0aGlzLnRlc3QubG9jYWxzLCAoKSA9PiB0aGlzLnJlc3VsdC52ZXJpZnkoKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0XHR0aGlzLnJlc3VsdC52ZXJpZnkoKVxuXHRcdH1cblx0fSxcblxuXHRDYXRjaCgpIHtcblx0XHRjaGVjayh0aGlzLmNhdWdodC5vcFR5cGUgPT09IG51bGwsIHRoaXMuY2F1Z2h0LmxvYywgJ1RPRE86IENhdWdodCB0eXBlcycpXG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuY2F1Z2h0LCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdENsYXNzKCkge1xuXHRcdHZlcmlmeU9wKHRoaXMub3BTdXBlckNsYXNzKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmtpbmRzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdGlmICh0aGlzLm9wQ29uc3RydWN0b3IgIT09IG51bGwpXG5cdFx0XHR0aGlzLm9wQ29uc3RydWN0b3IudmVyaWZ5KHRoaXMub3BTdXBlckNsYXNzICE9PSBudWxsKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0Q2xhc3NLaW5kRG8oKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuZGVjbGFyZUZvY3VzLCAoKSA9PiB0aGlzLmJsb2NrLnZlcmlmeSgpKVxuXHR9LFxuXG5cdENvbmQoKSB7XG5cdFx0dGhpcy50ZXN0LnZlcmlmeSgpXG5cdFx0dGhpcy5pZlRydWUudmVyaWZ5KClcblx0XHR0aGlzLmlmRmFsc2UudmVyaWZ5KClcblx0fSxcblxuXHRDb25kaXRpb25hbCgpIHtcblx0XHR0aGlzLnRlc3QudmVyaWZ5KClcblx0XHR3aXRoSWlmZUlmKHRoaXMuaXNWYWwsICgpID0+IHRoaXMucmVzdWx0LnZlcmlmeSgpKVxuXHR9LFxuXG5cdENvbnN0cnVjdG9yKGNsYXNzSGFzU3VwZXIpIHtcblx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdHdpdGhNZXRob2QodGhpcywgKCkgPT4geyB0aGlzLmZ1bi52ZXJpZnkoKSB9KVxuXG5cdFx0Y29uc3Qgc3VwZXJDYWxsID0gcmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuZ2V0KHRoaXMpXG5cblx0XHRpZiAoY2xhc3NIYXNTdXBlcilcblx0XHRcdGNoZWNrKHN1cGVyQ2FsbCAhPT0gdW5kZWZpbmVkLCB0aGlzLmxvYywgKCkgPT5cblx0XHRcdFx0YENvbnN0cnVjdG9yIG11c3QgY29udGFpbiAke2NvZGUoJ3N1cGVyIScpfWApXG5cdFx0ZWxzZVxuXHRcdFx0Y2hlY2soc3VwZXJDYWxsID09PSB1bmRlZmluZWQsICgpID0+IHN1cGVyQ2FsbC5sb2MsICgpID0+XG5cdFx0XHRcdGBDbGFzcyBoYXMgbm8gc3VwZXJjbGFzcywgc28gJHtjb2RlKCdzdXBlciEnKX0gaXMgbm90IGFsbG93ZWQuYClcblxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1lbWJlckFyZ3MpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRFeGNlcHQoKSB7XG5cdFx0dGhpcy50cnkudmVyaWZ5KClcblx0XHR2ZXJpZnlPcCh0aGlzLmNhdGNoKVxuXHRcdHZlcmlmeU9wKHRoaXMuZmluYWxseSlcblx0fSxcblxuXHRGb3JCYWcoKSB7XG5cdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKHRoaXMuYnVpbHQsICgpID0+IHZlcmlmeUZvcih0aGlzKSlcblx0fSxcblxuXHRGb3IoKSB7XG5cdFx0dmVyaWZ5Rm9yKHRoaXMpXG5cdH0sXG5cblx0RnVuKCkge1xuXHRcdGlmICh0aGlzLm9wUmV0dXJuVHlwZSAhPT0gbnVsbCkge1xuXHRcdFx0Y2hlY2sodGhpcy5ibG9jayBpbnN0YW5jZW9mIEJsb2NrVmFsLCB0aGlzLmxvYyxcblx0XHRcdFx0J0Z1bmN0aW9uIHdpdGggcmV0dXJuIHR5cGUgbXVzdCByZXR1cm4gc29tZXRoaW5nLicpXG5cdFx0XHRpZiAodGhpcy5ibG9jayBpbnN0YW5jZW9mIEJsb2NrVmFsVGhyb3cpXG5cdFx0XHRcdHdhcm4oJ1JldHVybiB0eXBlIGlnbm9yZWQgYmVjYXVzZSB0aGUgYmxvY2sgYWx3YXlzIHRocm93cy4nKVxuXHRcdH1cblxuXHRcdHdpdGhCbG9ja0xvY2FscygoKSA9PiB7XG5cdFx0XHR3aXRoSW5GdW5LaW5kKHRoaXMua2luZCwgKCkgPT5cblx0XHRcdFx0d2l0aExvb3AobnVsbCwgKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGFsbEFyZ3MgPSBjYXQodGhpcy5vcERlY2xhcmVUaGlzLCB0aGlzLmFyZ3MsIHRoaXMub3BSZXN0QXJnKVxuXHRcdFx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbHMoYWxsQXJncywgKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0XHRcdFx0dmVyaWZ5T3AodGhpcy5vcFJldHVyblR5cGUpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSkpXG5cdFx0fSlcblxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdEZ1bkFic3RyYWN0KCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFyZ3MpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFJlc3RBcmcpXG5cdFx0dmVyaWZ5T3AodGhpcy5vcFJldHVyblR5cGUpXG5cdH0sXG5cblx0SWdub3JlKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmlnbm9yZWROYW1lcylcblx0XHRcdGFjY2Vzc0xvY2FsKHRoaXMsIF8pXG5cdH0sXG5cblx0S2luZCgpIHtcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdXBlcktpbmRzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BEbylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5zdGF0aWNzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLm1ldGhvZHMpXG5cdFx0XHRfLnZlcmlmeSgpXG5cdFx0Ly8gbmFtZSBzZXQgYnkgQXNzaWduU2luZ2xlXG5cdH0sXG5cblx0TGF6eSgpIHtcblx0XHR3aXRoQmxvY2tMb2NhbHMoKCkgPT4gdGhpcy52YWx1ZS52ZXJpZnkoKSlcblx0fSxcblxuXHRMb2NhbEFjY2VzcygpIHtcblx0XHRjb25zdCBkZWNsYXJlID0gbG9jYWxzLmdldCh0aGlzLm5hbWUpXG5cdFx0aWYgKGRlY2xhcmUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYnVpbHRpblBhdGggPSBvcHRpb25zLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0XHRpZiAoYnVpbHRpblBhdGggPT09IHVuZGVmaW5lZClcblx0XHRcdFx0ZmFpbE1pc3NpbmdMb2NhbCh0aGlzLmxvYywgdGhpcy5uYW1lKVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG5hbWVzID0gcmVzdWx0cy5idWlsdGluUGF0aFRvTmFtZXMuZ2V0KGJ1aWx0aW5QYXRoKVxuXHRcdFx0XHRpZiAobmFtZXMgPT09IHVuZGVmaW5lZClcblx0XHRcdFx0XHRyZXN1bHRzLmJ1aWx0aW5QYXRoVG9OYW1lcy5zZXQoYnVpbHRpblBhdGgsIG5ldyBTZXQoW3RoaXMubmFtZV0pKVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0bmFtZXMuYWRkKHRoaXMubmFtZSlcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0cy5sb2NhbEFjY2Vzc1RvRGVjbGFyZS5zZXQodGhpcywgZGVjbGFyZSlcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChkZWNsYXJlLCB0aGlzKVxuXHRcdH1cblx0fSxcblxuXHQvLyBBZGRpbmcgTG9jYWxEZWNsYXJlcyB0byB0aGUgYXZhaWxhYmxlIGxvY2FscyBpcyBkb25lIGJ5IEZ1biBvciBsaW5lTmV3TG9jYWxzLlxuXHRMb2NhbERlY2xhcmUoKSB7XG5cdFx0Y29uc3QgYnVpbHRpblBhdGggPSBvcHRpb25zLmJ1aWx0aW5OYW1lVG9QYXRoLmdldCh0aGlzLm5hbWUpXG5cdFx0aWYgKGJ1aWx0aW5QYXRoICE9PSB1bmRlZmluZWQpXG5cdFx0XHR3YXJuKHRoaXMubG9jLCBgTG9jYWwgJHtjb2RlKHRoaXMubmFtZSl9IG92ZXJyaWRlcyBidWlsdGluIGZyb20gJHtjb2RlKGJ1aWx0aW5QYXRoKX0uYClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSlcblx0fSxcblxuXHRMb2NhbE11dGF0ZSgpIHtcblx0XHRjb25zdCBkZWNsYXJlID0gZ2V0TG9jYWxEZWNsYXJlKHRoaXMubmFtZSwgdGhpcy5sb2MpXG5cdFx0Y2hlY2soZGVjbGFyZS5pc011dGFibGUoKSwgdGhpcy5sb2MsICgpID0+IGAke2NvZGUodGhpcy5uYW1lKX0gaXMgbm90IG11dGFibGUuYClcblx0XHQvLyBUT0RPOiBUcmFjayBtdXRhdGlvbnMuIE11dGFibGUgbG9jYWwgbXVzdCBiZSBtdXRhdGVkIHNvbWV3aGVyZS5cblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0TG9naWMoKSB7XG5cdFx0Y2hlY2sodGhpcy5hcmdzLmxlbmd0aCA+IDEsICdMb2dpYyBleHByZXNzaW9uIG5lZWRzIGF0IGxlYXN0IDIgYXJndW1lbnRzLicpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuYXJncylcblx0XHRcdF8udmVyaWZ5KClcblx0fSxcblxuXHROb3QoKSB7XG5cdFx0dGhpcy5hcmcudmVyaWZ5KClcblx0fSxcblxuXHROdW1iZXJMaXRlcmFsKCkgeyB9LFxuXG5cdE1hcEVudHJ5KCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5rZXkudmVyaWZ5KClcblx0XHR0aGlzLnZhbC52ZXJpZnkoKVxuXHR9LFxuXG5cdE1lbWJlcigpIHtcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlckZ1bigpIHtcblx0XHR2ZXJpZnlPcCh0aGlzLm9wT2JqZWN0KVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdE1lbWJlclNldCgpIHtcblx0XHR0aGlzLm9iamVjdC52ZXJpZnkoKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BUeXBlKVxuXHRcdHRoaXMudmFsdWUudmVyaWZ5KClcblx0fSxcblxuXHRNZXRob2QoKSB7XG5cdFx0b2tUb05vdFVzZS5hZGQodGhpcy5mdW4ub3BEZWNsYXJlVGhpcylcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5mdW4uYXJncylcblx0XHRcdG9rVG9Ob3RVc2UuYWRkKF8pXG5cdFx0b3BFYWNoKHRoaXMuZnVuLm9wUmVzdEFyZywgXyA9PiBva1RvTm90VXNlLmFkZChfKSlcblx0XHR0aGlzLmZ1bi52ZXJpZnkoKVxuXHRcdC8vIG5hbWUgc2V0IGJ5IEFzc2lnblNpbmdsZVxuXHR9LFxuXG5cdE1ldGhvZEltcGwoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmZ1bi5vcERlY2xhcmVUaGlzKVxuXHRcdFx0dGhpcy5mdW4udmVyaWZ5KClcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RHZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHRva1RvTm90VXNlLmFkZCh0aGlzLmRlY2xhcmVUaGlzKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FscyhbdGhpcy5kZWNsYXJlVGhpc10sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXHRNZXRob2RTZXR0ZXIoKSB7XG5cdFx0dmVyaWZ5TWV0aG9kSW1wbCh0aGlzLCAoKSA9PiB7XG5cdFx0XHR2ZXJpZnlBbmRQbHVzTG9jYWxzKFt0aGlzLmRlY2xhcmVUaGlzLCB0aGlzLmRlY2xhcmVGb2N1c10sICgpID0+IHtcblx0XHRcdFx0dGhpcy5ibG9jay52ZXJpZnkoKVxuXHRcdFx0fSlcblx0XHR9KVxuXHR9LFxuXG5cdE1vZHVsZSgpIHtcblx0XHQvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGlzLmRvSW1wb3J0cy5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5pbXBvcnRzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BJbXBvcnRHbG9iYWwpXG5cblx0XHR3aXRoTmFtZShvcHRpb25zLm1vZHVsZU5hbWUoKSwgKCkgPT4ge1xuXHRcdFx0dmVyaWZ5TGluZXModGhpcy5saW5lcylcblx0XHR9KVxuXHR9LFxuXG5cdE1vZHVsZUV4cG9ydCgpIHtcblx0XHR0aGlzLmFzc2lnbi52ZXJpZnkoKVxuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLmFzc2lnbi5hbGxBc3NpZ25lZXMoKSlcblx0XHRcdHNldERlY2xhcmVBY2Nlc3NlZChfLCB0aGlzKVxuXHR9LFxuXG5cdE5ldygpIHtcblx0XHR0aGlzLnR5cGUudmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdE9iakVudHJ5QXNzaWduKCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dGhpcy5hc3NpZ24udmVyaWZ5KClcblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hc3NpZ24uYWxsQXNzaWduZWVzKCkpXG5cdFx0XHRzZXREZWNsYXJlQWNjZXNzZWQoXywgdGhpcylcblx0fSxcblxuXHRPYmpFbnRyeVBsYWluKCkge1xuXHRcdGFjY2Vzc0xvY2FsKHRoaXMsICdidWlsdCcpXG5cdFx0dmVyaWZ5TmFtZSh0aGlzLm5hbWUpXG5cdFx0dGhpcy52YWx1ZS52ZXJpZnkoKVxuXHR9LFxuXG5cdE9ialNpbXBsZSgpIHtcblx0XHRjb25zdCBrZXlzID0gbmV3IFNldCgpXG5cdFx0Zm9yIChjb25zdCBwYWlyIG9mIHRoaXMucGFpcnMpIHtcblx0XHRcdGNvbnN0IHtrZXksIHZhbHVlfSA9IHBhaXJcblx0XHRcdGNoZWNrKCFrZXlzLmhhcyhrZXkpLCBwYWlyLmxvYywgKCkgPT4gYER1cGxpY2F0ZSBrZXkgJHtrZXl9YClcblx0XHRcdGtleXMuYWRkKGtleSlcblx0XHRcdHZhbHVlLnZlcmlmeSgpXG5cdFx0fVxuXHR9LFxuXG5cdEdldHRlckZ1bigpIHtcblx0XHR2ZXJpZnlOYW1lKHRoaXMubmFtZSlcblx0fSxcblxuXHRRdW90ZVBsYWluKCkge1xuXHRcdGZvciAoY29uc3QgXyBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0dmVyaWZ5TmFtZShfKVxuXHR9LFxuXG5cdFF1b3RlU2ltcGxlKCkge30sXG5cblx0UXVvdGVUYWdnZWRUZW1wbGF0ZSgpIHtcblx0XHR0aGlzLnRhZy52ZXJpZnkoKVxuXHRcdHRoaXMucXVvdGUudmVyaWZ5KClcblx0fSxcblxuXHRSYW5nZSgpIHtcblx0XHR0aGlzLnN0YXJ0LnZlcmlmeSgpXG5cdFx0dmVyaWZ5T3AodGhpcy5lbmQpXG5cdH0sXG5cblx0U2V0U3ViKCkge1xuXHRcdHRoaXMub2JqZWN0LnZlcmlmeSgpXG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMuc3ViYmVkcylcblx0XHRcdF8udmVyaWZ5KClcblx0XHR2ZXJpZnlPcCh0aGlzLm9wVHlwZSlcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdH0sXG5cblx0U3BlY2lhbERvKCkgeyB9LFxuXG5cdFNwZWNpYWxWYWwoKSB7XG5cdFx0c2V0TmFtZSh0aGlzKVxuXHR9LFxuXG5cdFNwcmVhZCgpIHtcblx0XHR0aGlzLnNwcmVhZGVkLnZlcmlmeSgpXG5cdH0sXG5cblx0U3VwZXJDYWxsKCkge1xuXHRcdGNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdNdXN0IGJlIGluIGEgbWV0aG9kLicpXG5cdFx0cmVzdWx0cy5zdXBlckNhbGxUb01ldGhvZC5zZXQodGhpcywgbWV0aG9kKVxuXG5cdFx0aWYgKG1ldGhvZCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB7XG5cdFx0XHRjaGVjayghdGhpcy5pc1ZhbCwgdGhpcy5sb2MsICgpID0+XG5cdFx0XHRcdGAke2NvZGUoJ3N1cGVyJyl9IGluIGNvbnN0cnVjdG9yIG11c3QgYXBwZWFyIGFzIGEgc3RhdGVtZW50LidgKVxuXHRcdFx0cmVzdWx0cy5jb25zdHJ1Y3RvclRvU3VwZXIuc2V0KG1ldGhvZCwgdGhpcylcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IF8gb2YgdGhpcy5hcmdzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHR9LFxuXG5cdFN1cGVyTWVtYmVyKCkge1xuXHRcdGNoZWNrKG1ldGhvZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdNdXN0IGJlIGluIG1ldGhvZC4nKVxuXHRcdHZlcmlmeU5hbWUodGhpcy5uYW1lKVxuXHR9LFxuXG5cdFN3aXRjaCgpIHtcblx0XHR3aXRoSWlmZUlmKHRoaXMuaXNWYWwsICgpID0+IHtcblx0XHRcdHRoaXMuc3dpdGNoZWQudmVyaWZ5KClcblx0XHRcdGZvciAoY29uc3QgcGFydCBvZiB0aGlzLnBhcnRzKVxuXHRcdFx0XHRwYXJ0LnZlcmlmeSgpXG5cdFx0XHR2ZXJpZnlPcCh0aGlzLm9wRWxzZSlcblx0XHR9KVxuXHR9LFxuXG5cdFN3aXRjaFBhcnQoKSB7XG5cdFx0Zm9yIChjb25zdCBfIG9mIHRoaXMudmFsdWVzKVxuXHRcdFx0Xy52ZXJpZnkoKVxuXHRcdHRoaXMucmVzdWx0LnZlcmlmeSgpXG5cdH0sXG5cblx0VGhyb3coKSB7XG5cdFx0dmVyaWZ5T3AodGhpcy5vcFRocm93bilcblx0fSxcblxuXHRJbXBvcnQ6IHZlcmlmeUltcG9ydCxcblx0SW1wb3J0R2xvYmFsOiB2ZXJpZnlJbXBvcnQsXG5cblx0V2l0aCgpIHtcblx0XHR0aGlzLnZhbHVlLnZlcmlmeSgpXG5cdFx0d2l0aElpZmUoKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuZGVjbGFyZS5uYW1lID09PSAnXycpXG5cdFx0XHRcdG9rVG9Ob3RVc2UuYWRkKHRoaXMuZGVjbGFyZSlcblx0XHRcdHZlcmlmeUFuZFBsdXNMb2NhbCh0aGlzLmRlY2xhcmUsICgpID0+IHsgdGhpcy5ibG9jay52ZXJpZnkoKSB9KVxuXHRcdH0pXG5cdH0sXG5cblx0WWllbGQoKSB7XG5cdFx0Y2hlY2soZnVuS2luZCAhPT0gRnVucy5QbGFpbiwgYENhbm5vdCAke2NvZGUoJzx+Jyl9IG91dHNpZGUgb2YgYXN5bmMvZ2VuZXJhdG9yLmApXG5cdFx0aWYgKGZ1bktpbmQgPT09IEZ1bnMuQXN5bmMpXG5cdFx0XHRjaGVjayh0aGlzLm9wWWllbGRlZCAhPT0gbnVsbCwgdGhpcy5sb2MsICdDYW5ub3QgYXdhaXQgbm90aGluZy4nKVxuXHRcdHZlcmlmeU9wKHRoaXMub3BZaWVsZGVkKVxuXHR9LFxuXG5cdFlpZWxkVG8oKSB7XG5cdFx0Y2hlY2soZnVuS2luZCA9PT0gRnVucy5HZW5lcmF0b3IsIHRoaXMubG9jLCBgQ2Fubm90ICR7Y29kZSgnPH5+Jyl9IG91dHNpZGUgb2YgZ2VuZXJhdG9yLmApXG5cdFx0dGhpcy55aWVsZGVkVG8udmVyaWZ5KClcblx0fVxufSlcblxuLy8gU2hhcmVkIGltcGxlbWVudGF0aW9uc1xuXG5mdW5jdGlvbiB2ZXJpZnlCYWdFbnRyeSgpIHtcblx0YWNjZXNzTG9jYWwodGhpcywgJ2J1aWx0Jylcblx0dGhpcy52YWx1ZS52ZXJpZnkoKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnlCbG9ja0J1aWxkKCkge1xuXHR2ZXJpZnlBbmRQbHVzTG9jYWwodGhpcy5idWlsdCwgKCkgPT4ge1xuXHRcdHZlcmlmeUxpbmVzKHRoaXMubGluZXMpXG5cdH0pXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUltcG9ydCgpIHtcblx0Ly8gU2luY2UgVXNlcyBhcmUgYWx3YXlzIGluIHRoZSBvdXRlcm1vc3Qgc2NvcGUsIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgc2hhZG93aW5nLlxuXHQvLyBTbyB3ZSBtdXRhdGUgYGxvY2Fsc2AgZGlyZWN0bHkuXG5cdGNvbnN0IGFkZFVzZUxvY2FsID0gXyA9PiB7XG5cdFx0Y29uc3QgcHJldiA9IGxvY2Fscy5nZXQoXy5uYW1lKVxuXHRcdGNoZWNrKHByZXYgPT09IHVuZGVmaW5lZCwgXy5sb2MsICgpID0+XG5cdFx0XHRgJHtjb2RlKF8ubmFtZSl9IGFscmVhZHkgaW1wb3J0ZWQgYXQgJHtwcmV2LmxvY31gKVxuXHRcdHZlcmlmeUxvY2FsRGVjbGFyZShfKVxuXHRcdHNldExvY2FsKF8pXG5cdH1cblx0Zm9yIChjb25zdCBfIG9mIHRoaXMuaW1wb3J0ZWQpXG5cdFx0YWRkVXNlTG9jYWwoXylcblx0b3BFYWNoKHRoaXMub3BJbXBvcnREZWZhdWx0LCBhZGRVc2VMb2NhbClcbn1cblxuLy8gSGVscGVycyBzcGVjaWZpYyB0byBjZXJ0YWluIE1zQXN0IHR5cGVzXG5cbmZ1bmN0aW9uIHZlcmlmeUZvcihmb3JMb29wKSB7XG5cdGNvbnN0IHZlcmlmeUJsb2NrID0gKCkgPT4gd2l0aExvb3AoZm9yTG9vcCwgKCkgPT4gZm9yTG9vcC5ibG9jay52ZXJpZnkoKSlcblx0aWZFbHNlKGZvckxvb3Aub3BJdGVyYXRlZSxcblx0XHQoe2VsZW1lbnQsIGJhZ30pID0+IHtcblx0XHRcdGJhZy52ZXJpZnkoKVxuXHRcdFx0dmVyaWZ5QW5kUGx1c0xvY2FsKGVsZW1lbnQsIHZlcmlmeUJsb2NrKVxuXHRcdH0sXG5cdFx0dmVyaWZ5QmxvY2spXG59XG5cbmZ1bmN0aW9uIHZlcmlmeUluTG9vcChsb29wVXNlcikge1xuXHRjaGVjayhvcExvb3AgIT09IG51bGwsIGxvb3BVc2VyLmxvYywgJ05vdCBpbiBhIGxvb3AuJylcbn1cblxuZnVuY3Rpb24gdmVyaWZ5TWV0aG9kSW1wbChfLCBkb1ZlcmlmeSkge1xuXHR2ZXJpZnlOYW1lKF8uc3ltYm9sKVxuXHR3aXRoTWV0aG9kKF8sIGRvVmVyaWZ5KVxufVxuIl19