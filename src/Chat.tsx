import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
} from "@microsoft/signalr";
import { useState, useEffect, useRef } from "react";
//import { API_URL } from "./config";

interface Message {
  username: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
  isWelcome?: boolean;
  isStats?: boolean;
}

interface ChatProps {
  username: string;
  channel: string;
}

function Chat({ username, channel }: ChatProps) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://oxieserver20250117001050.azurewebsites.net/chatHub", {
        skipNegotiation: false,
        transport: HttpTransportType.WebSockets,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start().then(() => {
        connection.invoke("JoinChannel", channel, username);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getMessageClassName = (msg: Message): string => {
    if (msg.isSystem) {
      return "text-white bg-slate-950";
    }
    if (msg.isWelcome) {
      return "text-red-500";
    }
    if (msg.isStats) {
      return "bg-blue-100 text-blue-800 p-2 rounded-md my-1 font-mono";
    }
    return "p-2 hover:bg-gray-50 rounded-md my-1";
  };

  return (
    <div className="flex flex-col items-center max-h-[80vh]">
      <div className="mb-2">
        <h3>
          Username: {username} : {channel}
        </h3>
      </div>
      <div className="flex flex-col justify-end chat overflow-scroll h-[80vh] max-h-[80vh] w-[80vw] max-w-[800px] no-scrollbar border border-gray-400 border-opacity-60 rounded-sm p-5">
        <div className="messages flex-col text-start">
          {messages.map((msg, i) => (
            <div key={i} className="mb-0.5">
              {!msg.isSystem && !msg.isWelcome && !msg.isStats && (
                <>
                  <strong>{msg.username}: </strong>
                </>
              )}
              <span className={getMessageClassName(msg)}>{msg.content}</span>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <input
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMessage(e.target.value)
          }
          onKeyDown={handleKeyPress}
          className="border border-black rounded-md p-1"
        />
        <button
          onClick={sendMessage}
          className="border border-black rounded-md p-1"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}

export default Chat;
