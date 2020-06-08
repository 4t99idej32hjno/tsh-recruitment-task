import test from 'ava'

import {matchRuntime} from './match-runtime'

test('spec', (t) => {
	const input = [
		{
			id: 0,
			runtime: 30,
		},
		{
			id: 1,
			runtime: 35,
		},
		{
			id: 2,
			runtime: 40,
		},
		{
			id: 3,
			runtime: 100,
		},
		{
			id: 4,
			runtime: 10,
		},
	]

	t.deepEqual(matchRuntime(35)(input), [
		{
			id: 0,
			runtime: 30,
		},
		{
			id: 1,
			runtime: 35,
		},
		{
			id: 2,
			runtime: 40,
		},
	])
})
