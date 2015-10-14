import {code} from '../../CompileError'
import {check, options} from '../context'
import {AssignSingle, ImportDo, ImportGlobal, Import, LD_Const, LD_Lazy, LocalDeclare,
	LocalDeclareName, Module, ModuleExportNamed, Quote} from '../MsAst'
import {G_Space, isGroup, isKeyword, KW_Dot, KW_Ellipsis, KW_Focus, KW_Import, KW_ImportDo,
	KW_ImportLazy} from '../Token'
import {checkNonEmpty, unexpected} from './checks'
import {justBlock, parseModuleBlock} from './parseBlock'
import {parseLocalDeclaresJustNames} from './parseLocalDeclares'
import parseName, {tryParseName} from './parseName'
import Slice from './Slice'
import tryTakeComment from './tryTakeComment'

export default tokens => {
	// Module doc comment must come first.
	const [opComment, rest0] = tryTakeComment(tokens)
	// Import statements must appear in order.
	const {imports: doImports, rest: rest1} = tryParseImports(KW_ImportDo, rest0)
	const {imports: plainImports, opImportGlobal, rest: rest2} = tryParseImports(KW_Import, rest1)
	const {imports: lazyImports, rest: rest3} = tryParseImports(KW_ImportLazy, rest2)

	const lines = parseModuleBlock(rest3)

	if (options.includeModuleName()) {
		const name = new LocalDeclareName(tokens.loc)
		const assign = new AssignSingle(tokens.loc, name,
			Quote.forString(tokens.loc, options.moduleName()))
		lines.push(new ModuleExportNamed(tokens.loc, assign))
	}

	const imports = plainImports.concat(lazyImports)
	return new Module(
		tokens.loc, opComment, doImports, imports, opImportGlobal, lines)
}

const
	tryParseImports = (importKeywordKind, tokens) => {
		if (!tokens.isEmpty()) {
			const line0 = tokens.headSlice()
			if (isKeyword(importKeywordKind, line0.head())) {
				const {imports, opImportGlobal} = parseImports(importKeywordKind, line0.tail())
				if (importKeywordKind !== KW_Import)
					check(opImportGlobal === null, line0.loc, 'Can\'t use global here.')
				return {imports, opImportGlobal, rest: tokens.tail()}
			}
		}
		return {imports: [], opImportGlobal: null, rest: tokens}
	},

	parseImports = (importKeywordKind, tokens) => {
		const lines = justBlock(importKeywordKind, tokens)
		let opImportGlobal = null

		const imports = []

		for (const line of lines.slices()) {
			const {path, name} = parseRequire(line.head())
			if (importKeywordKind === KW_ImportDo) {
				if (line.size() > 1)
					unexpected(line.second())
				imports.push(new ImportDo(line.loc, path))
			} else
				if (path === 'global') {
					check(opImportGlobal === null, line.loc, 'Can\'t use global twice')
					const {imported, opImportDefault} =
						parseThingsImported(name, false, line.tail())
					opImportGlobal = new ImportGlobal(line.loc, imported, opImportDefault)
				} else {
					const {imported, opImportDefault} =
						parseThingsImported(name, importKeywordKind === KW_ImportLazy, line.tail())
					imports.push(new Import(line.loc, path, imported, opImportDefault))
				}
		}

		return {imports, opImportGlobal}
	},

	parseThingsImported = (name, isLazy, tokens) => {
		const importDefault = () =>
			LocalDeclare.untyped(tokens.loc, name, isLazy ? LD_Lazy : LD_Const)
		if (tokens.isEmpty())
			return {imported: [], opImportDefault: importDefault()}
		else {
			const [opImportDefault, rest] = isKeyword(KW_Focus, tokens.head()) ?
				[importDefault(), tokens.tail()] :
				[null, tokens]
			const imported = parseLocalDeclaresJustNames(rest).map(l => {
				check(l.name !== '_', l.pos, () => `${code('_')} not allowed as import name.`)
				if (isLazy)
					l.kind = LD_Lazy
				return l
			})
			return {imported, opImportDefault}
		}
	},

	parseRequire = token => {
		const name = tryParseName(token)
		if (name !== null)
			return {path: name, name}
		else {
			check(isGroup(G_Space, token), token.loc, 'Not a valid module name.')
			const tokens = Slice.group(token)

			// Take leading dots. There can be any number, so count ellipsis as 3 dots in a row.
			let rest = tokens
			const parts = []
			const isDotty = _ =>
				isKeyword(KW_Dot, _) || isKeyword(KW_Ellipsis, _)
			const head = rest.head()
			if (isDotty(head)) {
				parts.push('.')
				if (isKeyword(KW_Ellipsis, head)) {
					parts.push('..')
					parts.push('..')
				}
				rest = rest.tail()

				while (!rest.isEmpty() && isDotty(rest.head())) {
					parts.push('..')
					if (isKeyword(KW_Ellipsis, rest.head())) {
						parts.push('..')
						parts.push('..')
					}
					rest = rest.tail()
				}
			}

			// Take name, then any number of dot-then-name (`.x`)
			for (;;) {
				checkNonEmpty(rest)
				parts.push(parseName(rest.head()))
				rest = rest.tail()

				if (rest.isEmpty())
					break

				// If there's something left, it should be a dot, followed by a name.
				if (!isKeyword(KW_Dot, rest.head()))
					unexpected(rest.head())
				rest = rest.tail()
			}

			return {path: parts.join('/'), name: parts[parts.length - 1]}
		}
	}