import LCUConnector from 'lcu-connector';
import axios, { AxiosInstance } from 'axios';
import https from 'https';

const connector = new LCUConnector();
var running = false;

const animatedTitle = async(title: string)=> {
    const chars = title.split('');
    process.title = '';

    chars.forEach((char, index)=> {
        setTimeout(()=> {
            process.title += char;

            if(index+1 >= chars.length) return animatedTitle(title);
        }, 125 * index)
    })
}

animatedTitle(`UTILS LOL @ryannospherys `); 
console.log(`\x1b[36mEsperando o lol abrir :p\n`);

const run = async(credentials: ICredentials)=> {
    if(!running) return;

    const api = new LCURequest(credentials);

    const phases = {
        "Lobby": async()=> await api.searchMatchmaking(),
        "ReadyCheck": async()=> await api.acceptMatchmaking(),
        "ChampSelect": async()=> await api.purchaseAramBoost(),
        "EndOfGame": async()=> await api.playAgain()
    }

    const phase = await api.getGameflowPhase();
    return phases[phase] ? phases[phase]() : undefined;
}

connector.on('connect', async(credentials: ICredentials)=> {
    console.log('Eba, lol tá aberto');
    running = true;
    setInterval(async()=> await run(credentials), 8000);
});

connector.on('disconnect', ()=> running = false);

connector.start();

class LCURequest {

    private api: AxiosInstance;

    constructor(private readonly credentials: ICredentials) {
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        this.api = axios.create({
            baseURL: `https://127.0.0.1:${this.credentials.port}`,
            headers: {
                'content-type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${this.credentials.username}:${this.credentials.password}`)
                .toString("base64")}`,
            },
            httpsAgent: agent
        });
    }

    public async getGameflowPhase() {        
        return await this.api.get(`lol-gameflow/v1/gameflow-phase`).then((response)=> response.data)
        .catch((error)=> console.log(`[ERROR] » ${error.response ? error.response.data.message : 'Client fechado ?'}`));
    }

    public async searchMatchmaking() {
        return await this.api.post(`lol-lobby/v2/lobby/matchmaking/search`)
        .then(()=> console.log(`entrando na fila baiano`))
        .catch(()=> undefined)
    }

    public async acceptMatchmaking() {
        return await this.api.post(`lol-matchmaking/v1/ready-check/accept`)
        .then(()=> console.log(`pronto amigo você pode intar com sua skinzinha`))
        .catch(()=> undefined)
    }

    public async purchaseAramBoost() {
        return await this.api.post(`lol-champ-select/v1/team-boost/purchase`)
        .then(()=> console.log(`toma skin free teu filha da puta pobre`))
        .catch(()=> undefined)
    }

    public async playAgain() {
        return await this.api.post(`/lol-lobby/v2/play-again`)
        .then(()=> console.log('la vamos nois intar dnv no aram pqp'))
        .catch(()=> undefined)
    }
}

interface ICredentials {
    address: string;
    port: number;
    username: string;
    password: string;
    protocol: string;
}
