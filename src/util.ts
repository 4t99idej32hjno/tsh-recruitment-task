import {NextFunction, Request, Response} from 'express'
import {Either, isLeft} from 'fp-ts/lib/Either'
import {Option, none, some} from 'fp-ts/lib/Option'
import * as t from 'io-ts'
import {reporter} from 'io-ts-reporters'
import {withMessage} from 'io-ts-types/lib/withMessage'
import pLimit from 'p-limit'

export interface StringOfLengthBrand {
	readonly StringOfLength: unique symbol
}

export const stringOfLength = (min: number, max: number) =>
	withMessage(
		t.brand(
			t.string,
			(s): s is t.Branded<string, StringOfLengthBrand> =>
				s.length >= min && s.length <= 255,
			'StringOfLength'
		),
		(s) =>
			typeof s === 'string'
				? `Exprected length ${min} >= x >= ${max}, got ${s.length}`
				: 'Unknown length'
	)

export const assertDecode = (msg: string) => <A>(
	e: Either<t.Errors, A>
) => {
	if (isLeft(e)) {
		throw new Error([msg, ...reporter(e)].join('\n'))
	}

	return e.right
}

export const optional = <T extends t.Mixed>(x: T) =>
	t.union([x, t.undefined])

export const wrapExpressHandler = (
	callback: (req: Request, res: Response) => Promise<unknown>
) => (req: Request, res: Response, next: NextFunction) =>
	callback(req, res).catch(next)

export const arrify = <T>(x: T | T[]): T[] => (Array.isArray(x) ? x : [x])

export const randomArrayItem = <T>(array: T[]): Option<T> =>
	array.length === 0
		? none
		: some(array[Math.floor(Math.random() * array.length)])

export type MaybePromise<T> = T | Promise<T>
export const serial = <R>(fn: () => Promise<R>) => {
	const limit = pLimit(1)

	return async (callback: (arg: R) => MaybePromise<unknown>) => {
		await limit(async () => {
			const returned = await fn()

			await callback(returned)
		})
	}
}
