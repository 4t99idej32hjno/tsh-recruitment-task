import {promises as fs} from 'fs'

import * as t from 'io-ts'

import {assertDecode, optional, serial, stringOfLength} from './util'

export const DatabaseTemplate = t.type({
	genres: t.array(t.string),
	movies: t.unknown,
})

export const MovieTemplate = t.type({
	id: t.number,
	title: t.string,
	year: t.string,
	runtime: t.number,
	genres: t.array(t.string),
	director: t.string,
	actors: optional(t.string),
	plot: optional(t.string),
	posterUrl: optional(t.string),
})
export type MovieTemplate = t.TypeOf<typeof MovieTemplate>

type DatabaseDriverTemplate<T> = T extends (
	p: string
) => (callback: (arg: infer Arg) => unknown) => Promise<unknown>
	? (callback: (arg: Arg) => unknown) => Promise<unknown>
	: never
export type DatabaseDriver = DatabaseDriverTemplate<typeof makeDb>
export const makeDb = (p: string) =>
	serial(async () => {
		const raw = await fs.readFile(p, 'utf8')
		const dbTemplateData = assertDecode(
			'Failed to parse database contents'
		)(DatabaseTemplate.decode(JSON.parse(raw) as unknown))

		const {genres} = dbTemplateData

		interface GenreBrand {
			readonly Genre: unique symbol
		}

		const Genre = t.brand(
			t.string,
			(s): s is t.Branded<string, GenreBrand> => genres.includes(s),
			'Genre'
		)
		type Genre = t.TypeOf<typeof Genre>

		const Movie = t.intersection([
			MovieTemplate,
			t.type({
				genres: t.array(Genre),
			}),
		])
		type Movie = t.TypeOf<typeof Movie>

		const Database = t.type({
			genres: t.array(Genre),
			movies: t.array(Movie),
		})
		type Database = t.TypeOf<typeof Database>

		const databaseData = assertDecode('Database integrity error')(
			Database.decode(dbTemplateData)
		)

		const NewMovieInput = t.type({
			genres: t.array(Genre),
			title: stringOfLength(1, 255),
			year: t.number,
			runtime: t.number,
			director: stringOfLength(1, 255),
			actors: optional(t.string),
			plot: optional(t.string),
			posterUrl: optional(t.string),
		})
		type NewMovieInput = t.TypeOf<typeof NewMovieInput>

		let nextId = databaseData.movies.reduce(
			(max, movie) => Math.max(max, movie.id),
			0
		)

		const write = async (database: Database): Promise<void> => {
			await fs.writeFile(p, JSON.stringify(database, null, 4))
		}

		const addMovie = (movie: NewMovieInput) =>
			write({
				genres: databaseData.genres,
				movies: [
					...databaseData.movies,
					{
						id: nextId++,
						title: movie.title,
						year: String(movie.year),
						runtime: movie.runtime,
						genres: movie.genres,
						director: movie.director,
						actors: movie.actors,
						plot: movie.plot,
						posterUrl: movie.posterUrl,
					},
				],
			})

		const getMovies = (): Movie[] => databaseData.movies

		return {
			Genre,
			Movie,
			NewMovieInput,
			addMovie,
			getMovies,
		}
	})
