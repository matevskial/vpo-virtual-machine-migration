const path = require('path')
const express = require('express')
const app = express()

const port = 3000

const staticContentPath = path.join(__dirname, 'public')

const staticContentMiddleWare = express.static(staticContentPath)

app.use(staticContentMiddleWare)

app.get('/hello', (req, res) => {
  res.send('Hello simple web app!')
})

app.listen(port, () => {
  console.log(`Simple web app listening at http://localhost:${port}`)
})
