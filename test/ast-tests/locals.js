import {AssignDestructure, AssignSingle, LocalAccess, LocalDeclare, LocalDeclares, LocalMutate,
	Throw} from '../../dist/private/MsAst'
import {aDeclare, assignAZero, bDeclare, loc, one, zero} from './util/ast-util'
import {test} from './util/test-asts'

describe('locals', () => {
	// TODO: Lazy

	test(
		`
			ze-ro = 0
			throw ze-ro`,
		[
			new AssignSingle(loc, LocalDeclare.plain(loc, 'ze-ro'), zero),
			new Throw(loc, new LocalAccess(loc, 'ze-ro'))
		],
		`
			const ze_45ro=0;
			throw ze_45ro`,
		{name: 'LocalAccess'})

	describe('AssignSingle', () => {
		test(
			'a = 0',
			assignAZero,
			'const a=0',
			{warnings: ['Unused local variable {{a}}.']})
		test(
			'a ::= 0',
			new AssignSingle(loc, LocalDeclare.untyped(loc, 'a', LocalDeclares.Mutable), zero),
			'let a=0',
			{warnings: ['Unused local variable {{a}}.']})
		test(
			'~a = 0',
			new AssignSingle(loc, LocalDeclare.untyped(loc, 'a', LocalDeclares.Lazy), zero),
			'const a=_ms.lazy(()=>0)',
			{warnings: ['Unused local variable {{a}}.']})
	})

	test(
		'a b = 0',
		new AssignDestructure(loc, [aDeclare, bDeclare], zero),
		'const _$0=0,a=_$0.a,b=_$0.b',
		{warnings: ['Unused local variable {{b}}.', 'Unused local variable {{a}}.']})

	test(
		`
			a ::= 0
			a := 1`,
		[
			new AssignSingle(loc, LocalDeclare.untyped(loc, 'a', LocalDeclares.Mutable), zero),
			new LocalMutate(loc, 'a', one)
		],
		`
			let a=0;
			a=1`,
		{
			warnings: ['Unused local variable {{a}}.']
		})
})
