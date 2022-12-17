/* This is a random chat, once logged with your username, you get to talk with a random person also logged */

import Server from "./classes/Server";
import User from "./classes/UserClass";

const mode = process.argv[2];


if (mode === "server"){
    const server = new Server();
    server.start();
}
else if (mode === "user"){
    const user = new User();
    user.start();
}
else{
    console.log("Invalid mode ");
    process.exit();
};
