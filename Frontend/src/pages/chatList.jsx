import React from "react";
import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import Chats from "../components/chats.jsx";

export default function ChatList() {
  const userID = JSON.parse(localStorage.getItem("user"))._id;
  console.log("UID", userID);

  const socket = useMemo(
    () =>
      io("http://localhost:3000", {
        withCredentials: true,
        query: { userID },
      }),
    []
  );

  const [currentChat, setCurrentChat] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [messageSent, setSentMessage] = useState(0);
  useEffect(() => {
    socket.on("connectedUser", () => {});
    socket.on("disconnect", () => {
      console.log("SOCKET DISCONNECTED");
    });
    // Other events
    socket.on("receive-messages-from-server", (transmit) => {
      console.log(transmit, "TRANSMIT");

      if (transmit) {
        setCurrentChat(transmit);
      } else {
        setCurrentChat(null);
      }
    });
  });

  const [ticketsChat, setTicketsChat] = useState(null);
  const token = localStorage.getItem("token");
  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/tickets/`, {
      headers: { authorization: `Bearer ${token}` },
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTicketsChat(data.tickets);
      });
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <ul className="list bg-base-100 rounded-box shadow-md">
          {ticketsChat
            ? ticketsChat.map((ticket, index) => {
                return (
                  <li className="list-row" key={index}>
                    <div className="text-4xl font-thin opacity-30 tabular-nums">
                      {index + 1}
                    </div>

                    <div className="list-col-grow">
                      <div>{ticket.title}</div>
                      <div className="text-xs font-semibold opacity-60">
                        Chat with assigned moderator
                      </div>
                    </div>
                    <button
                      className="btn btn-square btn-ghost"
                      onClick={() => {
                        socket.emit("retrieve-ticket-specific-messages", {
                          ticket: ticket,
                          receiver: userID,
                        });
                        setShowChat(true);
                      }}
                    >
                      Chat
                    </button>
                  </li>
                );
              })
            : ``}
        </ul>
        {showChat ? (
          <Chats
            currentChat={currentChat}
            userID={userID}
            socket={socket}
            messageSent={messageSent}
            setSentMessage={setSentMessage}
          />
        ) : (
          <div className="flex justify-center bg-neutral-800">Open Chat</div>
        )}
      </div>
    </>
  );
}
