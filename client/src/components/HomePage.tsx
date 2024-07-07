import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useLoggedInAuth } from "./context/AuthContext";
import { useLocalStorage } from "./hooks/useLocalStorage";

type Channel = {
  id: string;
  name: string;
  image?: string;
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
  const [localUsers] = useLocalStorage<User[]>("users", []); // Retrieve users from local storage

  useEffect(() => {
    if (!socket) return;

    socket.emit("get_channels", { userId: user.id });

    socket.on("channels", (channels: Channel[]) => {
      setChannels(channels);
    });

    socket.on("messages", (messages: string[]) => {
      setMessages(messages);
    });

    // Emit get_users event with local users data
    socket.emit("get_users", localUsers);

    // Handle users event
    socket.on("users", (users: User[]) => {
      setUsers(users);
    });

    return () => {
      socket.off("channels");
      socket.off("messages");
      socket.off("users");
    };
  }, [socket, user.id, localUsers]);

  const handleChannelSelect = (channel: Channel) => {
    setActiveChannel(channel);
    if (socket)
        socket.emit("join_channel", { channelId: channel.id });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    if (socket)
        socket.emit("send_message", { channelId: activeChannel?.id, message: newMessage });
    setNewMessage("");
  };

  if (!socket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-container">
      <div className="channel-list">
        <Channels
          channels={channels}
          activeChannel={activeChannel}
          onChannelSelect={handleChannelSelect}
        />
      </div>
      <div className="chat-window">
        {activeChannel ? (
          <ChatWindow
            channel={activeChannel}
            messages={messages}
            newMessage={newMessage}
            onMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div>Select a channel to start chatting</div>
        )}
      </div>
      <div className="user-list">
        <h3>Users</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </div>
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
    <div className="w-60 flex flex-col gap-4 m-3 h-full">
      <Button onClick={() => navigate("/channel/new")}>New Conversation</Button>
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
              {channel.image && (
                <img
                  src={channel.image}
                  className="w-10 h-10 rounded-full object-center object-cover"
                />
              )}
              <div className="text-ellipsis overflow-hidden whitespace-nowrap">
                {channel.name || channel.id}
              </div>
            </button>
          );
        })
      ) : (
        "No Conversations"
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
    <div className="chat-window-inner">
      <div className="chat-header">
        <h2>{channel.name}</h2>
      </div>
      <div className="message-list">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
        />
        <Button onClick={onSendMessage}>Send</Button>
      </div>
    </div>
  );
}
