import {ArrowFunctionExpression, CallExpression, Identifier} from 'esast/dist/ast'
import {member} from 'esast/dist/util'

function ms(name) {
	const m = member(IdMs, name)
	// TODO:ES6 (...args) => new CallExpression(m, args)
	return function(...args) { return new CallExpression(m, args) }
}
export const
	IdMs = new Identifier('_ms'),
	lazyWrap = value =>
		msLazy(new ArrowFunctionExpression([], value)),
	msAdd = ms('add'),
	msAddMany = ms('addMany'),
	msAssert = ms('assert'),
	msAssertMember = ms('assertMember'),
	msAssertNot = ms('assertNot'),
	msAssertNotMember = ms('assertNotMember'),
	msAsync = ms('async'),
	msCheckContains = ms('checkContains'),
	msError = ms('error'),
	msGet = ms('get'),
	msGetDefaultExport = ms('getDefaultExport'),
	msExtract = ms('extract'),
	msGetModule = ms('getModule'),
	msLazy = ms('lazy'),
	msLazyGet = ms('lazyProp'),
	msLazyGetModule = ms('lazyGetModule'),
	msMethodBound = ms('methodBound'),
	msMethodUnbound = ms('methodUnbound'),
	msNewMutableProperty = ms('newMutableProperty'),
	msNewProperty = ms('newProperty'),
	msRange = ms('range'),
	msSetLazy = ms('setLazy'),
	msSetSub = ms('setSub'),
	msSome = ms('some'),
	msSymbol = ms('symbol'),
	msUnlazy = ms('unlazy'),
	MsNone = member(IdMs, 'None')
