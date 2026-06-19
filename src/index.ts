import 'dotenv/config'

import app, { SERVER_PORT } from './app';

//démarrage du serveur
app.listen(SERVER_PORT, () => {
    console.log(`🚀 Serveur sur http://localhost:${SERVER_PORT}`);
});