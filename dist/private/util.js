if (typeof define !== 'function') var define = require('amdefine')(module);define(['exports'], function (exports) {
	'use strict';

	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	const assert = cond => {
		if (!cond) throw new Error('Assertion failed.');
	},
	      cat = function () {
		// TODO:ES6 Splat
		const parts = Array.prototype.slice.call(arguments);
		const out = [];
		for (const _ of parts) if (_ instanceof Array) out.push(..._);else if (_ !== null) out.push(_);
		return out;
	},
	      flatMap = (mapped, mapper) => {
		const out = [];
		for (let i = 0; i < mapped.length; i = i + 1) out.push(...mapper(mapped[i], i));
		return out;
	},
	     

	// flatMap where opMapper returns optionals instead of arrays.
	flatOpMap = (arr, opMapper) => {
		const out = [];
		for (const em of arr) {
			const _ = opMapper(em);
			if (_ !== null) out.push(_);
		}
		return out;
	},
	      head = arr => {
		assert(!isEmpty(arr));
		return arr[0];
	},
	      ifElse = (op, ifSome, ifNone) => op === null ? ifNone() : ifSome(op),
	      implementMany = (holder, methodName, nameToImpl) => {
		for (const name in nameToImpl) holder[name].prototype[methodName] = nameToImpl[name];
	},
	      isEmpty = arr => arr.length === 0,
	     

	// -0 is negative
	isPositive = n => n >= 0 && 1 / n !== -Infinity,
	      last = arr => {
		assert(!isEmpty(arr));
		return arr[arr.length - 1];
	},
	      opEach = (op, mapper) => op === null ? null : mapper(op),
	      opIf = (cond, makeOp) => cond ? makeOp() : null,
	      opMap = opEach,
	      repeat = (em, n) => {
		assert(n >= 0);
		const out = [];
		for (let i = n; i > 0; i = i - 1) out.push(em);
		return out;
	},
	      reverseIter = function* (array) {
		for (let i = array.length - 1; i >= 0; i = i - 1) yield array[i];
	},
	      rtail = arr => {
		assert(!isEmpty(arr));
		return arr.slice(0, arr.length - 1);
	},
	      tail = arr => {
		assert(!isEmpty(arr));
		return arr.slice(1);
	},
	      type = (instance, itsType) => {
		if (!(Object(instance) instanceof itsType)) throw new Error(`${ instance } is not a ${ itsType.name }`);
	};
	exports.assert = assert;
	exports.cat = cat;
	exports.flatMap = flatMap;
	exports.flatOpMap = flatOpMap;
	exports.head = head;
	exports.ifElse = ifElse;
	exports.implementMany = implementMany;
	exports.isEmpty = isEmpty;
	exports.isPositive = isPositive;
	exports.last = last;
	exports.opEach = opEach;
	exports.opIf = opIf;
	exports.opMap = opMap;
	exports.repeat = repeat;
	exports.reverseIter = reverseIter;
	exports.rtail = rtail;
	exports.tail = tail;
	exports.type = type;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWwuanMiLCJwcml2YXRlL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0FPLE9BQ04sTUFBTSxHQUFHLElBQUksSUFBSTtBQUNoQixNQUFJLENBQUMsSUFBSSxFQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtFQUNyQztPQUVELEdBQUcsR0FBRyxZQUFXOztBQUVoQixRQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDbkQsUUFBTSxHQUFHLEdBQUcsRUFBRyxDQUFBO0FBQ2YsT0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQ3BCLElBQUksQ0FBQyxZQUFZLEtBQUssRUFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBLEtBQ1YsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUNsQixHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2IsU0FBTyxHQUFHLENBQUE7RUFDVjtPQUVELE9BQU8sR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLEtBQUs7QUFDN0IsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFBO0FBQ2QsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQzNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbEMsU0FBTyxHQUFHLENBQUE7RUFDVjs7OztBQUdELFVBQVMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLEtBQUs7QUFDOUIsUUFBTSxHQUFHLEdBQUcsRUFBRyxDQUFBO0FBQ2YsT0FBSyxNQUFNLEVBQUUsSUFBSSxHQUFHLEVBQUU7QUFDckIsU0FBTSxD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SyxDQUFDLENBQUMsR0FBRSxRQUFRLEVBQUMsVUFBVSxHQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUE7RUFDeEQsQ0FBQSIsImZpbGUiOiJwcml2YXRlL3V0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6W251bGwsImV4cG9ydCBjb25zdFxuXHRhc3NlcnQgPSBjb25kID0+IHtcblx0XHRpZiAoIWNvbmQpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Fzc2VydGlvbiBmYWlsZWQuJylcblx0fSxcblxuXHRjYXQgPSBmdW5jdGlvbigpIHtcblx0XHQvLyBUT0RPOkVTNiBTcGxhdFxuXHRcdGNvbnN0IHBhcnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuXHRcdGNvbnN0IG91dCA9IFsgXVxuXHRcdGZvciAoY29uc3QgXyBvZiBwYXJ0cylcblx0XHRcdGlmIChfIGluc3RhbmNlb2YgQXJyYXkpXG5cdFx0XHRcdG91dC5wdXNoKC4uLl8pXG5cdFx0XHRlbHNlIGlmIChfICE9PSBudWxsKVxuXHRcdFx0XHRvdXQucHVzaChfKVxuXHRcdHJldHVybiBvdXRcblx0fSxcblxuXHRmbGF0TWFwID0gKG1hcHBlZCwgbWFwcGVyKSA9PiB7XG5cdFx0Y29uc3Qgb3V0ID0gW11cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG1hcHBlZC5sZW5ndGg7IGkgPSBpICsgMSlcblx0XHRcdG91dC5wdXNoKC4uLm1hcHBlcihtYXBwZWRbaV0sIGkpKVxuXHRcdHJldHVybiBvdXRcblx0fSxcblxuXHQvLyBmbGF0TWFwIHdoZXJlIG9wTWFwcGVyIHJldHVybnMgb3B0aW9uYWxzIGluc3RlYWQgb2YgYXJyYXlzLlxuXHRmbGF0T3BNYXAgPSAoYXJyLCBvcE1hcHBlcikgPT4ge1xuXHRcdGNvbnN0IG91dCA9IFsgXVxuXHRcdGZvciAoY29uc3QgZW0gb2YgYXJyKSB7XG5cdFx0XHRjb25zdCBfID0gb3BNYXBwZXIoZW0pXG5cdFx0XHRpZiAoXyAhPT0gbnVsbClcblx0XHRcdFx0b3V0LnB1c2goXylcblx0XHR9XG5cdFx0cmV0dXJuIG91dFxuXHR9LFxuXG5cdGhlYWQgPSBhcnIgPT4ge1xuXHRcdGFzc2VydCghaXNFbXB0eShhcnIpKVxuXHRcdHJldHVybiBhcnJbMF1cblx0fSxcblxuXHRpZkVsc2UgPSAob3AsIGlmU29tZSwgaWZOb25lKSA9PlxuXHRcdG9wID09PSBudWxsID8gaWZOb25lKCkgOiBpZlNvbWUob3ApLFxuXG5cdGltcGxlbWVudE1hbnkgPSAoaG9sZGVyLCBtZXRob2ROYW1lLCBuYW1lVG9JbXBsKSA9PiB7XG5cdFx0Zm9yIChjb25zdCBuYW1lIGluIG5hbWVUb0ltcGwpXG5cdFx0XHRob2xkZXJbbmFtZV0ucHJvdG90eXBlW21ldGhvZE5hbWVdID0gbmFtZVRvSW1wbFtuYW1lXVxuXHR9LFxuXG5cdGlzRW1wdHkgPSBhcnIgPT4gYXJyLmxlbmd0aCA9PT0gMCxcblxuXHQvLyAtMCBpcyBuZWdhdGl2ZVxuXHRpc1Bvc2l0aXZlID0gbiA9PiBuID49IDAgJiYgMSAvIG4gIT09IC1JbmZpbml0eSxcblxuXHRsYXN0ID0gYXJyID0+IHtcblx0XHRhc3NlcnQoIWlzRW1wdHkoYXJyKSlcblx0XHRyZXR1cm4gYXJyW2Fyci5sZW5ndGggLSAxXVxuXHR9LFxuXG5cdG9wRWFjaCA9IChvcCwgbWFwcGVyKSA9PlxuXHRcdG9wID09PSBudWxsID8gbnVsbCA6IG1hcHBlcihvcCksXG5cblx0b3BJZiA9IChjb25kLCBtYWtlT3ApID0+XG5cdFx0Y29uZCA/IG1ha2VPcCgpIDogbnVsbCxcblxuXHRvcE1hcCA9IG9wRWFjaCxcblxuXHRyZXBlYXQgPSAoZW0sIG4pID0+IHtcblx0XHRhc3NlcnQobiA+PSAwKVxuXHRcdGNvbnN0IG91dCA9IFtdXG5cdFx0Zm9yIChsZXQgaSA9IG47IGkgPiAwOyBpID0gaSAtIDEpXG5cdFx0XHRvdXQucHVzaChlbSlcblx0XHRyZXR1cm4gb3V0XG5cdH0sXG5cblx0cmV2ZXJzZUl0ZXIgPSBmdW5jdGlvbiooYXJyYXkpIHtcblx0XHRmb3IgKGxldCBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+PSAwOyBpID0gaSAtIDEpXG5cdFx0XHR5aWVsZCBhcnJheVtpXVxuXHR9LFxuXG5cdHJ0YWlsID0gYXJyID0+IHtcblx0XHRhc3NlcnQoIWlzRW1wdHkoYXJyKSlcblx0XHRyZXR1cm4gYXJyLnNsaWNlKDAsIGFyci5sZW5ndGggLSAxKVxuXHR9LFxuXG5cdHRhaWwgPSBhcnIgPT4ge1xuXHRcdGFzc2VydCghaXNFbXB0eShhcnIpKVxuXHRcdHJldHVybiBhcnIuc2xpY2UoMSlcblx0fSxcblxuXHR0eXBlID0gKGluc3RhbmNlLCBpdHNUeXBlKSA9PiB7XG5cdFx0aWYgKCEoT2JqZWN0KGluc3RhbmNlKSBpbnN0YW5jZW9mIGl0c1R5cGUpKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGAke2luc3RhbmNlfSBpcyBub3QgYSAke2l0c1R5cGUubmFtZX1gKVxuXHR9XG4iXSwic291cmNlUm9vdCI6Ii9zcmMifQ==