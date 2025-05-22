/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import './App.css';
import Chat from './Chat';

function App() {
  const [name, setName] = useState<string>('');
  const [channel, setChannel] = useState<string>('channel-1');
  const [isNameSet, setIsNameSet] = useState<boolean>(false);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setChannel(event.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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
          <div>
            <h1 className="text-2xl mb-4">
              Välkommen till en billig Oxiekopia!
            </h1>
            <p>
              Sidan är bara en lekplats för att jag vill lära mig teknologier.
            </p>
            <p>
              Det finns många buggar så undvik gärna att aktivt leta efter dom
            </p>
            <p>
              Gå in i kanalen, om den är tom så starta spelet genom att skriva
              <strong> !start</strong> i chatten
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-10 justify-center sm:flex-row">
            <input
              value={name}
              placeholder="Namn"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              onKeyDown={handleKeyPress}
              className="border border-black rounded-md p-1"
            />
            {/* <select
              id="channelSelect"
              onChange={handleSelectChange}
              value={channel}
              className="border border-black rounded-md p-1"
            >
              <option value="channel-1">Channel 1</option>
              <option value="channel-2">Channel 2</option>
              <option value="channel-3">Channel 3</option>
            </select> */}
            <button
              onClick={() => setIsNameSet(true)}
              className="border border-black rounded-md p-1"
            >
              Gå in!
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default App;
