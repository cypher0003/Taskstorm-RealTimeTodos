import React, { useState } from 'react';
import { Users, PlusCircle, MessageCircle } from 'lucide-react';

const FriendsListItem = ({ friend, isSelected, onSelect }) => (
  <div 
    className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
      isSelected 
        ? 'bg-[#5a4a6c] text-white'
        : 'hover:bg-[#5a4a6c] hover:text-white'
    }`}
    onClick={() => onSelect(friend)}
  >
    <img 
      src={`/api/placeholder/40/40?text=${friend.name.charAt(0)}`}
      alt={friend.name}
      className="w-10 h-10 rounded-full mr-3" 
    />
    <span className="truncate">{friend.name}</span>
  </div>
);

const FriendsList = ({ friends, selectedFriend, onSelectFriend }) => {
  return (
    <div className="bg-[#3b3348] text-gray-400 w-64 p-4 flex flex-col">
      <div className="flex items-center mb-4">
        <Users className="mr-2" />
        <h3 className="text-xl font-bold">Freunde</h3>
      </div>
      <div className="flex-grow overflow-y-auto space-y-2">
        {friends.map(friend => (
          <FriendsListItem 
            key={friend.id}
            friend={friend}
            isSelected={selectedFriend?.id === friend.id}
            onSelect={onSelectFriend}
          />
        ))}
      </div>
      <div className="flex items-center p-3 rounded-md cursor-pointer hover:bg-[#5a4a6c] hover:text-white transition-colors">
        <PlusCircle className="w-6 h-6 mr-3" />
        <span>Freund hinzufügen</span>
      </div>
    </div>
  );
};

const ChatWindow = ({ selectedFriend, messages }) => {
  return (
    <div className="bg-gray-900 text-white flex-grow flex flex-col">
      {selectedFriend ? (
        <>
          <div className="bg-[#3b3348] p-4 flex items-center">
            <img 
              src={`/api/placeholder/40/40?text=${selectedFriend.name.charAt(0)}`}
              alt={selectedFriend.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <h3 className="text-xl font-bold">{selectedFriend.name}</h3>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className="flex items-end">
                <span className="font-medium mr-2">{msg.sender}:</span>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-[#3b3348] flex">
            <input
              type="text"
              placeholder="Nachricht schreiben..."
              className="flex-grow p-2 border rounded-l bg-gray-800 text-white"
            />
            <button className="bg-[#5a4a6c] text-white p-2 rounded-r">
              <MessageCircle />
            </button>
          </div>
        </>
      ) : (
        <div className="flex-grow flex items-center justify-center text-gray-500">
          Wähle einen Freund zum Chatten
        </div>
      )}
    </div>
  );
};

export function ChatApp() {
  const [selectedFriend, setSelectedFriend] = useState(null);

  const friends = [
    { id: 1, name: 'Anna' },
    { id: 2, name: 'Max' },
    { id: 3, name: 'Lisa' }
  ];

  const messages = [
    { sender: 'Anna', text: 'Hallo!' },
    { sender: 'Du', text: 'Hey, wie geht es dir?' },
    { sender: 'Anna', text: 'Gut, danke der Nachfrage!' },
  ];

  return (
    <div className="flex h-screen">
      <FriendsList 
        friends={friends}
        selectedFriend={selectedFriend}
        onSelectFriend={setSelectedFriend}
      />
      <ChatWindow
        selectedFriend={selectedFriend}
        messages={messages}
      />
    </div>
  );
}