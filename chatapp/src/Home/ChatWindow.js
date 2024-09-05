import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";

function ChatWindow({ friend, onClose, socket }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchMessages = async () => {
      try {
        console.log(friend)
        const response = await axios.get(
          `http://localhost:5000/api/chat/messages/${friend._id}`,
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );
        setMessages(response.data.messages.slice().reverse());
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

    // Listen for new messages
    const handleNewMessage = (newMessage) => {
      if (
        newMessage.sender === friend._id ||
        newMessage.receiver === friend._id
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    // Cleanup on unmount
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [friend, socket]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        await axios.post(
          "http://localhost:5000/api/chat/send",
          {
            receiverId: friend.name,
            message,
          },
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );

        // Update local messages
        setMessages([
          ...messages,
          {
            message: message,
            sender: JSON.parse(localStorage.getItem("user")).id,
            receiverId: friend._id,
            timestamp: new Date().toISOString(),
          },
        ]);
        setMessage(""); // Clear input field
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <>
      <div className="main-bar">
        <div className="fixed-bar">
          <h3>Chat with {friend.name}</h3>
          <button onClick={onClose} className="close">
            Close
          </button>
        </div>
        <div className="chat-bar">
          <div className="chat-body">
            {messages
              .map((msg, index) => (
                <div
                  className="msg-bar"
                  key={index}
                  style={
                    JSON.parse(localStorage.getItem("user")).id === msg.sender
                      ? { justifyContent: "end" }
                      : {}
                  }
                >
                  <div
                    className="msg"
                    style={
                      JSON.parse(localStorage.getItem("user")).id === msg.sender
                        ? { backgroundColor: "#d0ffd0" }
                        : { }
                    }
                  >
                    {msg.message}
                    <span style={{fontSize:6,position:"absolute",bottom:5,right:10}}>{formatTimestamp(msg.timestamp)}</span>
                  </div>

                </div>
              ))}
          </div>
        </div>
        <div className="fixed-bottom-bar">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </>
  );
}

export default ChatWindow;
