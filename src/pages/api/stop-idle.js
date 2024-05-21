export default async function handler(req, res) {
    const { steamAuth } = req.body.data;

    console.log(JSON.stringify({ serverMessage: 'stop-idle', steamAuth: steamAuth }));

    res.status(200).json('ok');
}
