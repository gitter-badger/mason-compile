import {code} from '../../CompileError'
import {check} from '../context'
import {LocalAccess, Switch, SwitchPart} from '../MsAst'
import {isKeyword, Keywords} from '../Token'
import {checkEmpty} from './checks'
import {parseExpr} from './parse*'
import {beforeAndBlock, parseBlockDoOrVal, parseJustBlockDoOrVal} from './parseBlock'
import parseSingle from './parseSingle'
import Slice from './Slice'

/** Parse a {@link Switch}. */
export default function parseSwitch(isVal, switchedFromFun, tokens) {
	const [before, block] = beforeAndBlock(tokens)

	if (switchedFromFun)
		checkEmpty(before, 'Value to switch on is `_`, the function\'s implicit argument.')
	const switched = switchedFromFun ? LocalAccess.focus(tokens.loc) : parseExpr(before)

	const lastLine = Slice.group(block.last())
	const [partLines, opElse] = isKeyword(Keywords.Else, lastLine.head()) ?
		[block.rtail(), parseJustBlockDoOrVal(isVal, Keywords.Else, lastLine.tail())] :
		[block, null]

	const parts = partLines.mapSlices(line => parseSwitchLine(isVal, line))
	check(parts.length > 0, tokens.loc, () => `Must have at least 1 non-${code('else')} test.`)

	return new Switch(tokens.loc, switched, parts, opElse)
}

function parseSwitchLine(isVal, line) {
	const [before, block] = beforeAndBlock(line)
	const values = isKeyword(Keywords.Or, before.head()) ?
		before.tail().map(parseSingle) :
		[parseExpr(before)]
	return new SwitchPart(line.loc, values, parseBlockDoOrVal(isVal, block))
}
