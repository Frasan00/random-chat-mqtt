import {connect} from "mqtt";

export default function connectMqtt(){
    const client = connect("mttq://broker.hivemq.com");
    client.on("connect", () => console.log("User connected to the broker"));
    client.on("error", () => console.log("An error occurred"));
    client.on("close", () => { console.log("User disconnected"); });
    return client
};
