import bodyParser from 'body-parser'
import express from 'express'
import {isLeft} from 'fp-ts/lib/Either'
import {identity} from 'fp-ts/lib/function'
import {fold as foldOption} from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import {reporter} from 'io-ts-reporters'
import {NumberFromString} from 'io-ts-types/lib/NumberFromString'

import {DatabaseDriver} from './db'
import {matchGenres} from './match-genres'
import {matchRuntime} from './match-runtime'
import {arrify, optional, randomArrayItem} from './util'
import {wrapExpressHandler as wrap} from './util'

export const makeApp = (withDatabase: DatabaseDriver) => {
	const app = express()

	app.use(bodyParser.json())

	app.post(
		'/new',
		wrap((req, res) =>
			withDatabase(async (connection) => {
				const body = req.body as unknown
				const inputEither = connection.NewMovieInput.decode(body)
				if (isLeft(inputEither)) {
					return res.status(400).send(reporter(inputEither))
				}
				await connection.addMovie(inputEither.right)
				res.sendStatus(204)
			})
		)
	)

	app.get(
		'/suggest',
		wrap((req, res) =>
			withDatabase(async (connection) => {
				const paramsEither = t
					.type({
						genres: optional(
							t.union([
								connection.Genre,
								t.array(connection.Genre),
							])
						),
						runtime: optional(NumberFromString),
					})
					.decode(req.query as unknown)

				if (isLeft(paramsEither)) {
					return res.status(400).send(reporter(paramsEither))
				}

				const params = paramsEither.right

				pipe(
					connection.getMovies(),
					params.runtime
						? matchRuntime(params.runtime)
						: identity,
					params.genres
						? matchGenres(arrify(params.genres))
						: identity,
					randomArrayItem,
					foldOption(
						() => {
							res.status(404).send(
								'Could not find a movie that matches the given parameters'
							)
						},
						(movie) => {
							res.status(200).send(movie)
						}
					)
				)
			})
		)
	)

	return app
}
