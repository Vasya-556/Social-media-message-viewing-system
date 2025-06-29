import { useState } from "react";
import api from "../api";
import 'ldrs/ring'
import { Quantum } from 'ldrs/react'
import 'ldrs/react/Quantum.css'

function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const telegramUsername = localStorage.getItem("telegram_username"); 

  const loadData = async () => {
    if (!telegramUsername) {
      setError("No telegram username found. Please login first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/fetch_chats_messages", {
        telegram_username: telegramUsername,
      });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Error fetching chats");
    }

    setLoading(false);
  };

  const downloadData = () => {
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "telegram_chats.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
  };

  return (
    <div className="home">
      <button onClick={loadData} disabled={loading}>
        {loading ? "Loading..." : "Load data"}
      </button>
      <br/>
      <button onClick={downloadData} disabled={!data}>
        Download data
      </button>
      <br/>
      <br/>
      {loading ? <>
      <Quantum
        size="45"
        speed="1.75"
        color="black" 
        />
      </> : <></>}

      {error && (
        <div style={{ color: "red", marginTop: 10 }}>{error}</div>
      )}

      {/* {data && (
        <pre style={{ maxHeight: 400, overflow: "auto", background: "#eee", padding: 10 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )} */}
      {data && (
        <div>
          <div>
            <h2>Chats</h2>
            <ul>
              {Object.keys(data).map((chatId) => (
                <li key={chatId}>
                    <button
                    className={selectedChat === chatId ? "selected-chat" : ""}
                    onClick={() => handleSelectChat(chatId)}>
                    Chat ID: {chatId}
                    </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2>Messages</h2>
            {selectedChat ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Sender ID</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {data[selectedChat].map((msg) => (
                    <tr key={msg.id}>
                      <td>{msg.id}</td>
                      <td>{msg.date}</td>
                      <td>{msg.sender_id}</td>
                      <td>{msg.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>Select a chat to view messages.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;