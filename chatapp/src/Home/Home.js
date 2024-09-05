import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import ChatWindow from "./ChatWindow";

function Home() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [chatWith, setChatWith] = useState(null);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setLoading(true);
        try {
          const response = await axios.get(
            "http://localhost:5000/api/auth/verify",
            {
              headers: {
                "x-auth-token": token,
              },
            }
          );
          if (response.data && response.data.user) {
            navigate("/");
          }
        } catch (err) {
          setError(err.response?.data?.msg || "Token verification failed");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/auth");
      }
    };

    checkTokenValidity();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/auth/users",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );
        setUsers(response.data);

        // Initialize socket connection after fetching users
        const userId = JSON.parse(localStorage.getItem("user")).id;
        const newSocket = io("http://localhost:5000", {
          query: { userId },
        });
        setSocket(newSocket);

        return () => newSocket.disconnect();
      } catch (err) {
        setError("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchFriends = () => {
      const savedFriends = JSON.parse(localStorage.getItem("friends")) || [];
      setFriends(savedFriends);
    };

    fetchFriends();
  }, []);

  const handleUserSelect = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleStartChat = () => {
    if (!selectedUser) {
      setError("Please select a user to start a chat.");
      return;
    }

    const user = users.find((user) => user._id === selectedUser);
    if (!user) return;

    const savedFriends = JSON.parse(localStorage.getItem("friends")) || [];

    // Check for duplicates
    const friendExists = savedFriends.some((friend) => friend._id === user._id);

    if (!friendExists) {
      // Save new friend details to localStorage
      savedFriends.push(user);
      localStorage.setItem("friends", JSON.stringify(savedFriends));
      setFriends(savedFriends); // Update state with new friends list
      setError(""); // Clear previous error if any
      alert(`Started chat with ${user.name}`);
    } else {
      setError("This user is already in your friends list.");
    }
  };

  const handleFriendClick = (friend) => {
    setChatWith(friend);
  };

  const handleCloseChat = () => {
    setChatWith(null);
  };

  return (
    <div>
      <div className="main-window">
        <div className="side-bar">
          <div className="user-list">
          <div className="pos-stik">
          <select value={selectedUser} onChange={handleUserSelect}>
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button onClick={handleStartChat}>Start Chat</button>
            {error && <p className="error-message">{error}</p>}
          </div>
            <div className="friends-list">
              <h2>Your Friends</h2>
              <ul>
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <li
                      key={friend._id}
                      onClick={() => handleFriendClick(friend)}
                    >
                      {friend.name}
                    </li>
                  ))
                ) : (
                  <li>No friends added yet.</li>
                )}
              </ul>
            </div>
            
          </div>
        </div>
        {console.log(chatWith)}
        {chatWith && socket && (
          <ChatWindow
            friend={chatWith}
            onClose={handleCloseChat}
            socket={socket}
          />
        )}
      </div>
    </div>
  );
}

export default Home;
