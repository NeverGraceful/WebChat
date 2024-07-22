import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useLoggedInAuth } from "./context/AuthContext";
import { useLocalStorage } from "./hooks/useLocalStorage";

type Channel = {
  id: string;
  name: string;
  members: string[];
};

type User = {
  id: string;
  name: string;
};

export function HomePage() {
  const { user, socket } = useLoggedInAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [localUsers] = useLocalStorage<User[]>("users", []);
  const [localChannels] = useLocalStorage<Channel[]>("channels", []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("update_channels", { localChannels });
    // console.log(localChannels);
    socket.emit("get_channels", { userId: user.id }, (response: any) => {
      if (response.success) {
        setChannels(response.channels);
      } else {
        console.error("Failed to get channels:", response.error);
      }
    });

    socket.on("messages", (messages: string[]) => {
      setMessages(messages);
    });

    socket.emit("add_and_get_users", localUsers, (response: any) => {
      if (response.success) {
        setUsers(response.users);
      } else {
        console.error("Failed to add users:", response.error);
      }
    });

    return () => {
      socket.off("messages");
    };
  }, [socket, user.id]);

  const handleChannelSelect = (channel: Channel) => {
    setActiveChannel(channel);
    if (socket) {
      socket.emit("join_channel", { channelId: channel.id });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    if (socket) {
      socket.emit("send_message", { channelId: activeChannel?.id, message: newMessage });
    }
    setNewMessage("");
  };

  if (!socket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 bg-gray-800 text-white">
        <Channels
          channels={channels}
          activeChannel={activeChannel}
          onChannelSelect={handleChannelSelect}
        />
      </div>
      <div className="flex-1 p-4 flex flex-col">
        {activeChannel ? (
          <ChatWindow
            channel={activeChannel}
            messages={messages}
            newMessage={newMessage}
            onMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a channel to start chatting
          </div>
        )}
      </div>
      {/* <div className="w-1/4 p-4 bg-gray-100">
        <h3 className="text-lg font-bold">Users</h3>
        <ul className="mt-4 space-y-2">
          {users.map((user) => (
            <li key={user.id} className="p-2 bg-white rounded-lg shadow">
              {user.name}
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}

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
              <div className="text-ellipsis overflow-hidden whitespace-nowrap">
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