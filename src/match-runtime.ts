export type MovieWithRuntime = {
	runtime: number
}

export const matchRuntime = (targetRuntime: number) => <
	T extends MovieWithRuntime
>(
	movies: T[]
): T[] =>
	movies.filter(({runtime}) => Math.abs(runtime - targetRuntime) < 10)
