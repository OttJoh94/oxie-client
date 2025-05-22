/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
} from '@microsoft/signalr';
import { useState, useEffect, useRef } from 'react';
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
  const [message, setMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [glowShadow, setGlowShadow] = useState('');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [showNewQuestionModal, setShowNewQuestionModal] =
    useState<boolean>(false);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('https://oxieserver20250117001050.azurewebsites.net/chatHub', {
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
        connection.invoke('JoinChannel', channel, username);

        connection.on('ReceiveMessage', (message: Message) => {
          if (message && typeof message === 'object') {
            setMessages((prev) => [...prev, message]);
          }
        });
      });

      return () => {
        connection.stop();
      };
    }
  }, [connection, channel]);

  const addQuestion = () => {
    if (newQuestion === '' || newAnswer === '') return;

    connection?.invoke('AddQuestion', newQuestion, newAnswer, username);

    setNewQuestion('');
    setNewAnswer('');
    setShowNewQuestionModal(false);
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
      setGlowShadow('');
    } else {
      setGlowShadow('inset 0 -8px 10px -8px rgba(249, 115, 22, 0.8)');
    }
  }, [messages, isAtBottom]);

  const sendMessage = async (): Promise<void> => {
    if (connection && message) {
      try {
        await connection.invoke('SendMessage', username, channel, message);
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsAtBottom(isNearBottom);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessageClassName = (msg: Message): string => {
    if (msg.isSystem) {
      return 'text-white bg-slate-950';
    }
    if (msg.isWelcome) {
      return 'text-red-500';
    }
    if (msg.isStats) {
      return 'bg-blue-100 text-blue-800 p-2 rounded-md my-1 font-mono';
    }
    return 'p-2 hover:bg-gray-50 rounded-md my-1';
  };

  return (
    <div className="flex flex-col items-center">
      {showNewQuestionModal && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgb(0,0,0,0.5)',
            overflow: 'none',
            top: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowNewQuestionModal(false)}
        >
          <div
            className=""
            style={{
              position: 'absolute',
              backgroundColor: 'whitesmoke',
              borderRadius: 10,
              boxShadow: '0px 0px 10px black',
              height: '60%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 20,
              padding: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <strong>Skriv in din nya fråga här</strong>
            <div>
              <p>Fråga</p>
              <input
                value={newQuestion}
                placeholder="Fråga"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewQuestion(e.target.value)
                }
                className="border border-black rounded-md p-1"
              />
            </div>
            <div>
              <p>Svar</p>
              <input
                value={newAnswer}
                placeholder="Svar"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewAnswer(e.target.value)
                }
                className="border border-black rounded-md p-1"
              />
            </div>
            <button
              onClick={addQuestion}
              className="border border-black rounded-md p-1 mt-10"
            >
              Skicka in frågan
            </button>
          </div>
        </div>
      )}

      <div
        className="mb-2"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '80vw',
          maxWidth: '800px',
          padding: 5,
        }}
      >
        <div style={{ width: 154 }}></div>
        <h3>
          Användarnamn: {username} : {channel}
        </h3>
        <button
          className="border border-black rounded-md p-1"
          onClick={() => setShowNewQuestionModal(true)}
        >
          Lägg till fråga
        </button>
      </div>
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{ boxShadow: glowShadow }}
        className="flex flex-col overflow-y-scroll h-[70vh] w-[80vw] max-w-[800px] no-scrollbar border border-gray-400 border-opacity-60 rounded-sm p-5 text-start"
      >
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
