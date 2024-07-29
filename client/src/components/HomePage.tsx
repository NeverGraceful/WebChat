import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useLoggedInAuth } from "./context/AuthContext";
// import { useLocalStorage } from "./hooks/useLocalStorage";

type Channel = {
  id: string;
  name: string;
  members: string[];
};

type User = {
  id: string;
  name: string;
};

const removeDuplicateChannels = (channels: Channel[]) => {
  const channelMap = new Map();
  channels.forEach((channel) => {
    channelMap.set(channel.id, channel);
  });
  return Array.from(channelMap.values());
};

const HomePage = () => {
  const navigate = useNavigate();
  const { logout, createChannel } = useLoggedInAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const storedChannels = JSON.parse(localStorage.getItem("channels") || "[]");
    setChannels(removeDuplicateChannels(storedChannels));
  }, []);

  useEffect(() => {
    // Update local storage whenever channels state changes
    localStorage.setItem("channels", JSON.stringify(channels));
  }, [channels]);

  const handleChannelSelect = (channel: Channel) => {
    setActiveChannel(channel);
  };

  const handleCreateChannel = (newChannel: Channel) => {
    createChannel.mutate(newChannel, {
      onSuccess: (data) => {
        setChannels((prevChannels) => {
          if (!prevChannels) {
            return removeDuplicateChannels(data.channels);
          }
  
          const mergedChannels = [...prevChannels, ...data.channels];
          const uniqueChannels = removeDuplicateChannels(mergedChannels);
  
          localStorage.setItem("channels", JSON.stringify(uniqueChannels));
          return uniqueChannels;
        });
        navigate("/");
      },
      onError: (error) => {
        console.error("Failed to create channel:", error);
        alert("Failed to create channel. Please try again.");
      },
    });
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 bg-gray-200 p-4">
        <Channels
          channels={channels}
          activeChannel={activeChannel}
          onChannelSelect={handleChannelSelect}
        />
      </div>
      <div className="flex-1 p-4">
        {activeChannel ? (
          <ChatWindow
            channel={activeChannel}
            messages={[]} // Replace with actual messages
            newMessage=""
            onMessageChange={() => {}}
            onSendMessage={() => {}}
          />
        ) : (
          <div>Select a conversation</div>
        )}
      </div>
    </div>
  );
};

function Channels({
  channels,
  activeChannel,
  onChannelSelect,
}: {
  channels: Channel[];
  activeChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
}) {
  const navigate = useNavigate();
  const { logout } = useLoggedInAuth();

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => navigate("/channel/new")} className="mb-4">
        New Conversation
      </Button>
      <hr className="border-gray-500" />
      {channels.length > 0 ? (
        channels.map((channel) => {
          const isActive = channel.id === activeChannel?.id;
          const extraClasses = isActive
            ? "bg-blue-500 text-white"
            : "hover:bg-blue-100 bg-gray-100";
          return (
            <button
              onClick={() => onChannelSelect(channel)}
              disabled={isActive}
              className={`p-4 rounded-lg flex gap-3 items-center ${extraClasses}`}
              key={channel.id}
            >
              <div className="text-ellipsis overflow-hidden whitespace-nowrap text-black">
                {channel.name || channel.id}
              </div>
            </button>
          );
        })
      ) : (
        <div>No Conversations</div>
      )}
      <hr className="border-gray-500 mt-auto" />
      <Button onClick={() => logout.mutate()} disabled={logout.isPending}>
        Logout
      </Button>
    </div>
  );
}

function ChatWindow({
  channel,
  messages,
  newMessage,
  onMessageChange,
  onSendMessage,
}: {
  channel: Channel;
  messages: string[];
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b-2 p-4">
        <h2 className="text-xl font-bold">{channel.name}</h2>
        {channel.members != undefined ? (
          <ul className="list-disc list-inside ml-4 mt-2">
            {channel.members.map((member, index) => (
              <li key={index} className="text-sm text-gray-700">
                {member}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500 mt-2">No members available</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="bg-gray-200 p-2 rounded-lg">
            {message}
          </div>
        ))}
      </div>
      <div className="p-4 flex items-center border-t-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          className="flex-1 p-2 border rounded-lg w-5/6"
        />
        <Button onClick={onSendMessage} className="ml-2 w-1/6">
          Send
        </Button>
      </div>
    </div>
  );
}

export default HomePage;