const express = require('express')
const PayPI = require('paypi').default
const app = express()

require('dotenv').config()

// Setup PayPI
const paypi = new PayPI(process.env.PAYPI_SECRET_KEY, {
    // host: 'http://localhost',
    // port: '8080',
    // basePath: '/graphql'
})

// ToYodaSpeak cuts a string into two peices and flips them round.
// Yoda actually uses object-subject-verb word ordering insead of
// English's subject-verb-object, however instead of whipping out
// NLP or training a TF model, just flipping the text works quite well.
function toYodaSpeak(s) {
    const split = s.toLowerCase().split(' ')

    // Find the center point of the text
    const splitPoint = Math.ceil(split.length / 2)

    const start = split.slice(0, splitPoint)
    const end = split.slice(splitPoint)

    // Put the end of the sentence at the start of the string.
    const flipped = `${end.join(' ')} ${start.join(' ')}`

    // Capitalise first character
    return flipped[0].toUpperCase() + flipped.slice(1)
}

// for testing purposes
module.exports = { toYodaSpeak }

async function handleYodaRequest(req, res) {
    const auth = (req.get('Authorization') || '').split('Bearer ')

    if (auth.length !== 2) {
        return res.status(401).send('User token not given')
    }

    let user
    try {
        user = await paypi.authenticate(auth[1])
    } catch (e) {
        console.log(e)
        return res.status(401).send('Unauthorized the request is')
    }

    const text = req.query.text

    try {
        // Charge the user once processing is complete
        await user.makeCharge(process.env.PAYPI_CHARGE_ID)
    } catch (e) {
        console.error(e)
        return res.status(503).send('Unable to make charge, the server is')
    }

    return res.json({
        text: toYodaSpeak(text)
    })
}

// Only host web server if runnning outside Jest
if (process.env.JEST_WORKER_ID === undefined) {
    app.get('/', handleYodaRequest)
    app.listen(80, () => console.log(`Yodafying text on port 80`))
}