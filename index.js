const express = require('express')
const cors = require('cors')
const server = express()

server.use(cors())

server.get('/', async (req, res, next) => {
  if (!req.query.username) {
    res.status(401).json({ message: 'Unauthorized' })
  }
  var usernameRegex = /^[a-zA-Z0-9]+$/
  if (!usernameRegex.test(req.query.username)) {
    res.status(400).json({ message: 'bad request' })
  }
  const py = await require('child_process').spawn('python', [
    './app.py',
    req.query.username
  ])
  try {
    py.stdout.on('data', data => {
      res.json(JSON.parse(data))
    })
  } catch (e) {
    py.stderr.on(
      'data',
      data => {
        console.log(`stderr: ${data}`)
        res.status(500).json({ message: 'An error has occurred.' })
      },
      e
    )
  } finally {
    py.on('close', (code, signal) => {
      console.log(`child process exited with code ${code} and signal ${signal}`)
    })
  }
})
server.listen(process.env.PORT || 3000, console.log('up and running'))
