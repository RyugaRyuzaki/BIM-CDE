import {PeerServer, IClient} from "peer";

const port: number = Number(process.env.PORT) || 3002;
//peer
const peerServer = PeerServer({port, path: "/"});

console.log(`Server is listening on port:${port}`);
