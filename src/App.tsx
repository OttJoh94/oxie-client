import { useState } from "react";
import "./App.css";
import Chat from "./Chat";

function App() {
  const [name, setName] = useState<string>("");
  const [channel, setChannel] = useState<string>("channel-1");
  const [isNameSet, setIsNameSet] = useState<boolean>(false);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setChannel(event.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsNameSet(true);
    }
  };

  return (
    <>
      {isNameSet ? (
        <>
          <Chat username={name} channel={channel} />
        </>
      ) : (
        <>
          <input
            value={name}
            placeholder="name"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            onKeyDown={handleKeyPress}
          />
          <select
            id="channelSelect"
            onChange={handleSelectChange}
            value={channel}
          >
            <option value="channel-1">Channel 1</option>
            <option value="channel-2">Channel 2</option>
            <option value="channel-3">Channel 3</option>
          </select>
          <button onClick={() => setIsNameSet(true)}>Gå in!</button>
        </>
      )}
    </>
  );
}

export default App;
