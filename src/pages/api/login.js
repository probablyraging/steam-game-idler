import SteamUser from 'steam-user';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body.data;

        const client = new SteamUser();
        client.setOptions({ autoRelogin: true });

        const steamId = await new Promise((resolve, reject) => {
            client.logOn({
                accountName: username,
                password: password,
                twoFactorCode: req.body.data.authCode || ''
            });

            client.on('steamGuard', () => {
                res.status(200).json({ requires2FA: true });
                resolve();
            });

            client.on('loggedOn', (e) => {
                const steamId = e.client_supplied_steamid;
                resolve(steamId);
            });

            client.on('error', (err) => {
                reject(err);
            });
        });

        res.status(200).json({ steamId });
    } else {
        res.status(200).end();
    }
}