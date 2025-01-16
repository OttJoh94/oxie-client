import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { useState, useEffect } from "react";

interface Message {
  username: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

interface ChatProps {
  username: string;
  channel: string;
}

function Chat({ username, channel }: ChatProps) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5053/chatHub")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start().then(() => {
        connection.invoke("JoinChannel", channel);

        connection.on("ReceiveMessage", (message: Message) => {
          if (message && typeof message === "object") {
            setMessages((prev) => [...prev, message]);
          }
        });
      });

      return () => {
        connection.stop();
      };
    }
  }, [connection, channel]);

  const sendMessage = async (): Promise<void> => {
    if (connection && message) {
      try {
        await connection.invoke("SendMessage", username, channel, message);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div>
      <div>
        <h3>
          Username: {username} : {channel}
        </h3>
      </div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${msg.isSystem ? "text-gray-500 italic" : ""}`}
          >
            {msg.isSystem ? (
              msg.content
            ) : (
              <>
                <strong>{msg.username}</strong>: {msg.content}
                <span className="text-xs text-gray-500 ml-2">
                  {" - "}
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setMessage(e.target.value)
        }
        onKeyDown={handleKeyPress}
      />
      <button onClick={sendMessage}>Skicka</button>
    </div>
  );
}

export default Chat;
