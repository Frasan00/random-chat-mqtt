
const Topics = {
    death: "server/death", // tells the server that the user is disconnected with the userId in the message
    alive: "server/alive",
    waitingRoom: (userID: string) => "user/waitingRoom/"+userID,
    doneChatting: (userID: string) => "server/doneChatting/"+userID,
};

export default Topics;

