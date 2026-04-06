import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './config/database.js'

const PORT = Number(process.env.PORT) || 5000

async function start() {
  try {
    await connectDatabase()
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  }
}

start()
