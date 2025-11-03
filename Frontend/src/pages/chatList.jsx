import React from "react";
import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

export default function ChatList() {
  const userID = JSON.parse(localStorage.getItem("user"))._id;
  console.log("UID", userID);

  const socket = useMemo(
    () =>
      io("http://localhost:3000", {
        withCredentials: true,
        query: { userID },
      }),
    [userID]
  );

  useEffect(() => {
    socket.on("connectedUser", () => {});
    socket.on("disconnect", () => {
      console.log("SOCKET DISCONNECTED");
    });
  });

  const [openChat, setOpenChat] = useState({
    sender: {
      messages: ["HI"],
    },
    receiver: {
      messages: ["Hey There"],
    },
  });

  const [showChat, setShowChat] = useState(false);
  if (showChat) {
    return (
      <>
        <div className="w-3xs m-auto flex flex-col justify-around">
          <div>
            <div className="chat chat-star ">
              <div className="chat-bubble">{openChat.receiver.messages[0]}</div>
            </div>
            <div className="chat chat-end">
              <div className="chat-bubble">{openChat.sender.messages[0]}</div>
            </div>
          </div>
          <input type="text" name="" id="" className="w-full h-52" />
        </div>
      </>
    );
  }

  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
        Most played songs this week
      </li>

      <li className="list-row">
        <div className="text-4xl font-thin opacity-30 tabular-nums">01</div>
        <div>
          <img
            className="size-10 rounded-box"
            src="https://img.daisyui.com/images/profile/demo/1@94.webp"
          />
        </div>
        <div className="list-col-grow">
          <div>Dio Lupa</div>
          <div className="text-xs uppercase font-semibold opacity-60">
            Remaining Reason
          </div>
        </div>
        <button
          className="btn btn-square btn-ghost"
          onClick={() => {
            setShowChat(true);
          }}
        >
          Chat
        </button>
      </li>

      <li className="list-row">
        <div className="text-4xl font-thin opacity-30 tabular-nums">02</div>
        <div>
          <img
            className="size-10 rounded-box"
            src="https://img.daisyui.com/images/profile/demo/4@94.webp"
          />
        </div>
        <div className="list-col-grow">
          <div>Ellie Beilish</div>
          <div className="text-xs uppercase font-semibold opacity-60">
            Bears of a fever
          </div>
        </div>
        <button className="btn btn-square btn-ghost">Chat</button>
      </li>

      <li className="list-row">
        <div className="text-4xl font-thin opacity-30 tabular-nums">03</div>
        <div>
          <img
            className="size-10 rounded-box"
            src="https://img.daisyui.com/images/profile/demo/3@94.webp"
          />
        </div>
        <div className="list-col-grow">
          <div>Sabrino Gardener</div>
          <div className="text-xs uppercase font-semibold opacity-60">
            Cappuccino
          </div>
        </div>
        <button className="btn btn-square btn-ghost">Chat</button>
      </li>
    </ul>
  );
}
