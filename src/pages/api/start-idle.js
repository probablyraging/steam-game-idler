export default async function handler(req, res) {
    const { gameIds, steamAuth } = req.body.data;

    console.log(JSON.stringify({ serverMessage: 'start-idle', gameIds: gameIds, steamAuth: steamAuth }));

    res.status(200).json('ok');
}
