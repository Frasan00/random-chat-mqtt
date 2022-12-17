import connectionMqtt from "../mqtt/mqttConnection";
import { MqttClient } from "mqtt";
import {v4 as uuid} from "uuid";
import topics from "../mqtt/topics";

const Dispatcher = require("mqtt-dispatcher");

export default class User{

    protected clientMqtt: MqttClient;
    protected dispatcher: any;
    protected userID: string;
    protected isChatting: number; // 0: non-chatting, 1: chatting

    constructor(){
        this.clientMqtt = connectionMqtt();
        this.userID = uuid().toString();
        this.dispatcher = new Dispatcher(this.clientMqtt);
        this.isChatting = 0; // avoid to iterate both freeUsers and busyUsers telling the server where it is when it has to be eliminated
    };

    start(){
        setTimeout(() => {
            // tells server that it exists after 1 second
            this.clientMqtt.publish(topics.alive, this.userID.toString());
        }, 1000)
        
        // user awaits his turn to chat
        this.dispatcher.addRule(topics.waitingRoom(this.userID), this.handleBeingRedirected.bind(this));
    };

    // simulation of a chat for 4 seconds
    protected handleBeingRedirected(_: any, message: string){
        console.log("You're now chatting... ");
        this.isChatting = 1;
        setTimeout(() => { this.handleDoneChatting() }, 4000)
    };

    protected handleDoneChatting(){
        this.isChatting = 0;
        this.clientMqtt.publish(topics.doneChatting(this.userID), this.userID.toString());
        console.log("Finished chatting!");
    };
};