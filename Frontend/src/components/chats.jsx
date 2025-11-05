import React, { useState } from "react";

function Chats({ currentChat, socket, messageSent, setSentMessage }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const messages = currentChat?.chats || [];
  const enabledChat = currentChat?.enabledChat;
  const userID = currentChat?.ticket?.createdBy;
  console.log("USERID", userID);

  const assignedTo =
    currentChat?.ticket?.assignedTo || currentChat?.ticket?.assignedTo?._id;
  const ticket = currentChat?.ticket; // define ticket properly
  let receiver = false;

  const [typedMsg, setTypedMsg] = useState("");

  const handleSend = () => {
    if (!typedMsg.trim()) return; // prevent empty messages
    console.log("DEBUG TICKET", ticket);

    socket.emit("send-message-to-user", {
      message: assignedTo ? typedMsg : "Message Not Sent",
      fromUserId: user.role === "user" ? userID : assignedTo,
      toUserId: user.role === "user" ? assignedTo : userID,
      ticket: ticket?._id,
    });

    setTypedMsg(""); // clear input after sending
    setSentMessage((prev) => {
      return prev + 1;
    });
  };

  return (
    <>
      <div>
        {messages.length > 0 ? (
          messages.map((message, index) => {
            receiver = message.receiver === userID;
            console.log(receiver, "BOOLM REC", message);

            return (
              <div key={index}>
                {receiver ? (
                  <div className="chat chat-end">
                    <div className="chat-bubble">{message.message}</div>
                  </div>
                ) : (
                  <div className="chat chat-start">
                    <div className="chat-bubble">{message.message}</div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No conversation yet</p>
        )}

        <div className="flex flex-col gap-2 mt-4">
          <input
            type="text"
            className="w-full border p-2"
            value={typedMsg}
            onChange={(e) => setTypedMsg(e.target.value)}
            // disabled={!enabledChat}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            // disabled={!enabledChat || !typedMsg.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}

export default Chats;
