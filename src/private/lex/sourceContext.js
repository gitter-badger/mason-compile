import {Pos, StartLine, StartColumn} from 'esast/dist/Loc'
import {code} from '../../CompileError'
import {check} from '../context'
import {Chars, showChar} from './chars'

/*
These are kept up-to-date as we iterate through sourceString.
Every access to index has corresponding changes to line and/or column.
This also explains why there are different functions for newlines vs other characters.
*/
export let index
export let line
export let column
export let sourceString

export function setupSourceContext(_sourceString) {
	sourceString = _sourceString
	index = 0
	line = StartLine
	column = StartColumn
}

/*
NOTE: We use character *codes* for everything.
Characters are of type Number and not just Strings of length one.
*/

export function pos() {
	return new Pos(line, column)
}

export function peek() {
	return sourceString.charCodeAt(index)
}
export function peekNext() {
	return sourceString.charCodeAt(index + 1)
}
export function peekPrev() {
	return sourceString.charCodeAt(index - 1)
}
export function peek2Before() {
	return sourceString.charCodeAt(index - 2)
}

// May eat a Newline.
// Caller *must* check for that case and increment line!
export function eat() {
	const char = sourceString.charCodeAt(index)
	skip()
	return char
}
export function skip() {
	index = index + 1
	column = column + 1
}

// charToEat must not be Newline.
export function tryEat(charToEat) {
	const canEat = peek() === charToEat
	if (canEat) {
		index = index + 1
		column = column + 1
	}
	return canEat
}

export function mustEat(charToEat, precededBy) {
	const canEat = tryEat(charToEat)
	check(canEat, pos, () =>
		`${code(precededBy)} must be followed by ${showChar(charToEat)}`)
}

export function tryEatNewline() {
	const canEat = peek() === Chars.Newline
	if (canEat) {
		index = index + 1
		line = line + 1
		column = StartColumn
	}
	return canEat
}

// Caller must ensure that backing up nCharsToBackUp characters brings us to oldPos.
export function stepBackMany(oldPos, nCharsToBackUp) {
	index = index - nCharsToBackUp
	line = oldPos.line
	column = oldPos.column
}

// For takeWhile, takeWhileWithPrev, and skipWhileEquals,
// characterPredicate must *not* accept Newline.
// Otherwise there may be an infinite loop!
export function takeWhile(characterPredicate) {
	return _takeWhileWithStart(index, characterPredicate)
}
export function takeWhileWithPrev(characterPredicate) {
	return _takeWhileWithStart(index - 1, characterPredicate)
}
export function _takeWhileWithStart(startIndex, characterPredicate) {
	skipWhile(characterPredicate)
	return sourceString.slice(startIndex, index)
}

export function skipWhileEquals(char) {
	return skipWhile(_ => _ === char)
}

export function skipRestOfLine() {
	return skipWhile(_ => _ !== Chars.Newline)
}

export function eatRestOfLine() {
	return takeWhile(_ => _ !== Chars.Newline)
}

export function skipWhile(characterPredicate) {
	const startIndex = index
	while (characterPredicate(peek()))
		index = index + 1
	const diff = index - startIndex
	column = column + diff
	return diff
}

// Called after seeing the first newline.
// Returns # total newlines, including the first.
export function skipNewlines() {
	const startLine = line
	line = line + 1
	while (peek() === Chars.Newline) {
		index = index + 1
		line = line + 1
	}
	column = StartColumn
	return line - startLine
}

// Sprinkle checkPos() around to debug line and column tracking errors.
/*
function checkPos() {
	const p = _getCorrectPos()
	if (p.line !== line || p.column !== column)
		throw new Error(`index: ${index}, wrong: ${Pos(line, column)}, right: ${p}`)
}
const _indexToPos = new Map()
function _getCorrectPos() {
	if (index === 0)
		return Pos(StartLine, StartColumn)

	let oldPos, oldIndex
	for (oldIndex = index - 1; ; oldIndex = oldIndex - 1) {
		oldPos = _indexToPos.get(oldIndex)
		if (oldPos !== undefined)
			break
		assert(oldIndex >= 0)
	}
	let newLine = oldPos.line, newColumn = oldPos.column
	for (; oldIndex < index; oldIndex = oldIndex + 1)
		if (sourceString.charCodeAt(oldIndex) === Newline) {
			newLine = newLine + 1
			newColumn = StartColumn
		} else
			newColumn = newColumn + 1

	const p = Pos(newLine, newColumn)
	_indexToPos.set(index, p)
	return p
}
*/
