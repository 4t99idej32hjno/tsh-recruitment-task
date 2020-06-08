import path from 'path'

import {makeApp} from './app'
import {makeDb} from './db'

const welcome = (port: number) => `Listening on port ${port}
GET /suggest
POST /new`

const main = async () => {
	const withDatabase = makeDb(path.join(__dirname, '../db.json'))

	// Verify integrity on startup
	await withDatabase(() => {})

	const app = makeApp(withDatabase)

	const port = 6900
	app.listen(port, () => console.log(welcome(port)))
}

main()
