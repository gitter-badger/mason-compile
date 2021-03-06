import {code} from '../../CompileError'
import {check} from '../context'
import {AssignDestructure, AssignSingle, ObjEntry} from '../MsAst'
import {assert, reverseIter} from '../util'
import {locals, pendingBlockLocals} from './context'
import {deleteLocal, registerLocal, setLocal} from './locals'
import SK from './SK'

/**
Verifies each line, accumulating locals.
@return List of every new local from `lines`.
*/
export default function verifyLines(lines) {
	/*
	We need to get all block locals up-front because
	Functions within lines can access locals from later lines.
	NOTE: We push these onto pendingBlockLocals in reverse
	so that when we iterate through lines forwards, we can pop from pendingBlockLocals
	to remove pending locals as they become real locals.
	It doesn't really matter what order we add locals in since it's not allowed
	to have two locals of the same name in the same block.
	*/
	const newLocals = []

	for (const line of reverseIter(lines))
		for (const _ of reverseIter(lineNewLocals(line))) {
			// Register the local now. Can't wait until the assign is verified.
			registerLocal(_)
			newLocals.push(_)
		}

	pendingBlockLocals.push(...newLocals)

	/*
	Keeps track of locals which have already been added in this block.
	Mason allows shadowing, but not within the same block.
	So, this is allowed:
		a = 1
		b =
			a = 2
			...
	But not:
		a = 1
		a = 2
	*/
	const thisBlockLocalNames = new Set()

	// All shadowed locals for this block.
	const shadowed = []

	for (const line of lines) {
		for (const newLocal of lineNewLocals(line)) {
			const name = newLocal.name
			const oldLocal = locals.get(name)
			if (oldLocal !== undefined) {
				check(!thisBlockLocalNames.has(name), newLocal.loc,
					() => `A local ${code(name)} is already in this block.`)
				shadowed.push(oldLocal)
			}
			thisBlockLocalNames.add(name)
			setLocal(newLocal)

			// Now that it's added as a local, it's no longer pending.
			// We added pendingBlockLocals in the right order that we can just pop them off.
			const popped = pendingBlockLocals.pop()
			assert(popped === newLocal)
		}
		line.verify(SK.Do)
	}

	newLocals.forEach(deleteLocal)
	shadowed.forEach(setLocal)
	return newLocals
}

function lineNewLocals(line) {
	return line instanceof AssignSingle ?
		[line.assignee] :
		line instanceof AssignDestructure ?
		line.assignees :
		line instanceof ObjEntry ?
		lineNewLocals(line.assign) :
		[]
}
