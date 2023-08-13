const express = require('express')
const bodyParser = require('body-parser')
const { v4: uuid } = require('uuid')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

function game_name_is_unique(name) {
    for (const game of games) {
        if (game.name === name) return false
    }
    return true
}

function teams_are_valid_and_unique(team1, team2) {
    const teams = team1.concat(team2)
    for (const player of teams) {
        if (typeof player !== 'string') return false
    }
    for (let i = 0; i < teams.length; i++) {
        for (let j = i+1; j < teams.length; j++) {
            if (teams[i] === teams[j]) return false
        }
    }
    return true
}

function game_is_ok(game) {
    return typeof game.name === 'string' &&
    typeof game.server_url === 'string' &&
    typeof game.team1.name === 'string' &&
    Array.isArray(game.team1.players) &&
    typeof game.team2.name === 'string' &&
    Array.isArray(game.team2.players) &&
    game_name_is_unique(game.name) &&
    game.team1.name !== game.team2.name &&
    teams_are_valid_and_unique(game.team1.players, game.team2.players)
}

function remove_game(name) {
    const games_len = games.length
    games = games.filter(game => game.name !== name)
    return games_len !== games.length
}

let games = []

app.post('/create', (req, res) => {
    const game = req.body
    if (
        typeof game.team1 !== 'string' ||
        typeof game.team2 !== 'string'
    ) {
        res.statusCode = 400
        res.end()
        return
    }
    game.team1 = JSON.parse(game.team1)
    game.team2 = JSON.parse(game.team2)

    if (!game_is_ok(game)) {
        res.statusCode = 400
        res.end()
        return
    }

    console.log(game)

    games.push(game)
    res.end()
})

app.post('/remove', (req, res) => {
    const name = req.body.name
    if (typeof name !== 'string') {
        res.statusCode = 400
        res.end()
        return
    }
    const suc = remove_game(name)
    if (suc) res.statusCode = 200
    else res.statusCode = 304
    res.end()
})

app.get('/get_game', (req, res) => {
    const name = req.query.name
    if (typeof name !== 'string') {
        res.statusCode = 400
        res.end()
        return
    }
    for (const game of games) {
        if (game.name === name) {
            res.end(JSON.stringify(game))
        }
    }
    res.statusCode = 404
    res.end()
})

setInterval(() => console.log(games), 3000)

app.listen(666)