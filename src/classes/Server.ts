import connectionMqtt from "../mqtt/mqttConnection";
import { MqttClient } from "mqtt";
import topics from "../mqtt/topics";

const Dispatcher = require("mqtt-dispatcher");

export default class Server{

    protected clientMqtt: MqttClient;
    protected dispatcher: any;
    protected freeUsers: string[];
    protected busyUsers: string[];

    constructor(){
        this.clientMqtt = connectionMqtt();
        this.dispatcher = new Dispatcher(this.clientMqtt);
        this.freeUsers = [];
        this.busyUsers = [];
    };

    start(){
        this.dispatcher.addRule(topics.death, this.eliminateUser.bind(this));
        this.dispatcher.addRule(topics.alive, this.handleNewUser.bind(this));
        
        //every 6 seconds connect users in freeUsers
        const loop = setInterval(() => {this.connectUsers();}, 6000);
        

    };

    protected connectUsers(){
        // every 5 seconds tries to connect users that have been shuffled
        this.freeUsers = this.shuffle(this.freeUsers);

        while (true){
            // with user1 and user2, server pub at user1 the chat topic with user2 and viceversa
            if (this.freeUsers.length === 0 || this.freeUsers.length === 1) break; // general break case
            let userID1 = this.freeUsers[0].toString();
            let userID2 = this.freeUsers[1].toString();

            this.clientMqtt.publish(topics.waitingRoom(userID1), userID2);
            this.clientMqtt.publish(topics.waitingRoom(userID2), userID1);

            // listens for when the users stop chatting
            this.dispatcher.addRule(topics.doneChatting(userID1), this.handleDoneChatting.bind(this));
            this.dispatcher.addRule(topics.doneChatting(userID2), this.handleDoneChatting.bind(this));

            this.busyUsers.push(userID1);
            this.busyUsers.push(userID2);

            this.freeUsers.shift();
            this.freeUsers.shift();
        };
    };

    protected handleDoneChatting(_: any, message: string){
        // adjust the lists
        this.freeUsers.push(message.toString());
        this.busyUsers = this.busyUsers.filter((id) => id !== message.toString());
        // finish to listen on doneChatting topic for that user 
        this.dispatcher.removeRule(topics.doneChatting(message.toString()));
    };

    protected handleNewUser(_: any, message: string){
        // adds user to db
        this.freeUsers.push(message.toString());
        console.log("New user added "+message.toString());
        
    };

    protected eliminateUser(_: any, message: string){
        const userStatus: any[] = JSON.parse(message);
        const userID: string = userStatus[0]
        const status: string = userStatus[1]
        if (status === "0"){
            this.freeUsers = this.freeUsers.filter((id) => id !== userID);
            console.log(this.freeUsers, 123)
        }
        else {
            this.freeUsers = this.busyUsers.filter((id) => id !== userID);
        }
        console.log("User disconnected: "+userID)
        this.dispatcher.removeRule(topics.doneChatting(message.toString()));
    };

    protected shuffle(a: any[]){
        let j = 0;
        let x = 0;
        for (let i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        };
        return a;
    };
}
