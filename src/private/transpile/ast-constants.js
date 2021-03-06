import {ArrayExpression, AssignmentExpression, Identifier, Literal, NewExpression, ObjectExpression,
	ReturnStatement, SwitchCase, ThisExpression, VariableDeclaration, VariableDeclarator}
	from 'esast/dist/ast'
import {member} from 'esast/dist/util'
import {throwErrorFromString} from './util'

export const
	GlobalError = new Identifier('Error'),
	GlobalInfinity = new Identifier('Infinity'),
	IdArguments = new Identifier('arguments'),
	IdBuilt = new Identifier('built'),
	IdError = new Identifier('Error'),
	IdExports = new Identifier('exports'),
	IdExtract = new Identifier('_$'),
	IdFocus = new Identifier('_'),
	IdLexicalThis = new Identifier('_this'),
	IdLoop = new Identifier('loop'),
	IdSuper = new Identifier('super'),
	LitEmptyArray = new ArrayExpression([]),
	LitEmptyString = new Literal(''),
	LitNull = new Literal(null),
	LitStrThrow = new Literal('An error occurred.'),
	LitTrue = new Literal(true),
	LitZero = new Literal(0),
	ReturnBuilt = new ReturnStatement(IdBuilt),
	ReturnFocus = new ReturnStatement(IdFocus),
	SwitchCaseNoMatch = new SwitchCase(undefined, [
		throwErrorFromString('No branch of `switch` matches.')]),
	SymbolIterator = member(new Identifier('Symbol'), 'iterator'),
	ThrowAssertFail = throwErrorFromString('Assertion failed.'),
	ThrowNoCaseMatch = throwErrorFromString('No branch of `case` matches.'),

	ArraySliceCall = member(member(LitEmptyArray, 'slice'), 'call'),
	DeclareBuiltBag = new VariableDeclaration('let',
		[new VariableDeclarator(IdBuilt, LitEmptyArray)]),
	DeclareBuiltMap = new VariableDeclaration('let', [
		new VariableDeclarator(IdBuilt,
			new NewExpression(member(new Identifier('global'), 'Map'), []))]),
	DeclareBuiltObj = new VariableDeclaration('let', [
		new VariableDeclarator(IdBuilt, new ObjectExpression([]))]),
	ExportsDefault = member(IdExports, 'default'),

	DeclareLexicalThis = new VariableDeclaration('let',
		[new VariableDeclarator(IdLexicalThis, new ThisExpression())]),
	LetLexicalThis = new VariableDeclaration('let', [new VariableDeclarator(IdLexicalThis)]),
	SetLexicalThis = new AssignmentExpression('=', IdLexicalThis, new ThisExpression())
