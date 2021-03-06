import {DocComment} from '../Token'
import {assert, isEmpty} from '../util'

/**
Takes DocComment lines and puts them into a comment.
@return {?string}
*/
export default function tryTakeComment(lines) {
	const comments = []
	let rest = lines

	while (!rest.isEmpty()) {
		const hs = rest.headSlice()
		const h = hs.head()
		if (!(h instanceof DocComment))
			break

		assert(hs.size() === 1)
		comments.push(h)
		rest = rest.tail()
	}

	return [isEmpty(comments) ? null : comments.map(_ => _.text).join('\n'), rest]
}
