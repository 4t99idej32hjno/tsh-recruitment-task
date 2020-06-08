export type MovieWithGenre = {
	genres: string[]
}

// To ease with testing this function is pure and takes in an
// array of objects that only need a `genres` property (we don't
// have to care about the whole movie object since we only use
// `genres` in this function)
export const matchGenres = (targetGenres: string[]) => <
	T extends MovieWithGenre
>(
	movies: T[]
): T[] => {
	// Assign each movie the number of matching target genres
	const moviesWithMatchingGenresAmount = movies.map(
		(movie) =>
			[
				movie,
				movie.genres.reduce(
					(n, genre) =>
						targetGenres.includes(genre) ? n + 1 : n,
					0
				),
			] as const
	)

	// Find the maximum amount of matching genres
	const maxMatchingGenres = moviesWithMatchingGenresAmount.reduce(
		(max, [, x]) => Math.max(max, x),
		0
	)

	// Return all movies with matching genres amount ==
	// `maxMatchingGenres`
	return moviesWithMatchingGenresAmount
		.filter(
			([_, matchingGenresAmount]) =>
				matchingGenresAmount === maxMatchingGenres
		)
		.map(([movie]) => movie)
}
