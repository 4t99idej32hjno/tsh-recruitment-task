import test from 'ava'

import {matchGenres} from './match-genres'

test('1', (t) => {
	const input = [
		{
			id: 0,
			genres: ['Comedy', 'Fantasy', 'Crime'],
		},
		{
			id: 1,
			genres: ['Comedy', 'Fantasy', 'Crime'],
		},
		{
			id: 2,
			genres: ['Irrelevant'],
		},
	]

	t.deepEqual(matchGenres(['Comedy', 'Fantasy', 'Crime'])(input), [
		{id: 0, genres: ['Comedy', 'Fantasy', 'Crime']},
		{id: 1, genres: ['Comedy', 'Fantasy', 'Crime']},
	])
})

test('2', (t) => {
	const input = [
		{
			id: 0,
			genres: ['Comedy', 'Fantasy'],
		},
		{
			id: 1,
			genres: ['Comedy', 'Crime'],
		},
		{
			id: 2,
			genres: ['Fantasy', 'Crime'],
		},
		{
			id: 3,
			genres: ['Irrelevant'],
		},
	]

	t.deepEqual(matchGenres(['Comedy', 'Fantasy', 'Crime'])(input), [
		{id: 0, genres: ['Comedy', 'Fantasy']},
		{id: 1, genres: ['Comedy', 'Crime']},
		{id: 2, genres: ['Fantasy', 'Crime']},
	])
})

test('3', (t) => {
	const input = [
		{
			id: 0,
			genres: ['Comedy'],
		},
		{
			id: 1,
			genres: ['Fantasy'],
		},
		{
			id: 2,
			genres: ['Crime'],
		},
		{
			id: 3,
			genres: ['Irrelevant'],
		},
	]

	t.deepEqual(matchGenres(['Comedy', 'Fantasy', 'Crime'])(input), [
		{id: 0, genres: ['Comedy']},
		{id: 1, genres: ['Fantasy']},
		{id: 2, genres: ['Crime']},
	])
})
