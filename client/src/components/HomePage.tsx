import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useLoggedInAuth } from "./context/AuthContext";
import { Socket } from "socket.io-client";
// import { useLocalStorage } from "./hooks/useLocalStorage";

interface Channel {
  id: string,
  name: string,
  members: string[],
  messages: Message[]
};

interface Message {
  name: string,
  text: string,
  time: string
}

const removeDuplicateChannels = (channels: Channel[]) => {
  const channelMap = new Map();
  channels.forEach((channel) => {
    channelMap.set(channel.id, channel);
  });
  return Array.from(channelMap.values());
};

const get_channel = (channelId: string, channels: Channel[], socket?: Socket ): Channel | undefined => {
  if (socket){
    socket.emit('update_channels', { localChannels: channels })
    socket.emit('get_channel', {channelId}, (response: any) => {
      if (response.success){
        return response.channel
      }
    });
  } 
  return undefined;
};

export const HomePage = () => {
  const { socket, user } = useLoggedInAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const storedChannels = JSON.parse(localStorage.getItem("channels") || "[]");
    setChannels(removeDuplicateChannels(storedChannels));
  }, []);

  useEffect(() => {
    localStorage.setItem("channels", JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    if (!socket) return;

    // const socketHandleSendMessage = (channelId: string, message: Message, callback: any) => {
    //   const channel = get_channel(channelId, channels);
    //   if (channel) {
    //     channel.messages.push(message);
    //     console.log(channel.messages);
    //     callback({ success: true, channel: channel.messages });
    //     if (activeChannel?.id === channelId) {
    //       setMessages([...channel.messages]);
    //     }
    //   } else {
    //     callback({ success: false, error: "Couldn't find channel" });
    //   }
    // };

    socket.on('get_channel_messages', (channelId: string, callback: any) => {
      const channel = get_channel(channelId, channels);
      if (channel) {
        if (channel.messages.length === 0) {
          console.log("No messages in channel");
        }
        callback({ success: true, channel: channel.messages });
        setMessages(channel.messages);
      } else {
        callback({ success: false, error: "Couldn't find channel" });
      }
    });

    // socket.on('send_message', (channelId: string, message: Message, callback: any) => {
    //   console.log('Received send_message event', channelId, message);
    //   const channel = get_channel(channelId, channels);
    //   if (channel && channel != undefined) {
    //     channel.messages.push(message);
    //     console.log(channel.messages);
    //     callback({ success: true, channel: channel.messages });
    //     if (activeChannel?.id === channelId) {
    //       setMessages([...channel.messages]);
    //     }
    //   } else {
    //     console.log("Channel is null")
    //     callback({ success: false, error: "Couldn't find channel" });
    //   }
    // });

    return () => {
      socket.off('get_channel_messages');
      socket.off('send_message');
    };
  }, [activeChannel, channels, socket]);

  const handleChannelSelect = (channel: Channel) => {
    if (!socket) return;

    setActiveChannel(channel);
    socket.emit('get_channel_messages', channel.id, (response: any) => {
      if (response.success) {
        setMessages(response.channel);
      } else {
        console.error(response.error);
      }
    });
  };

  const handleSendMessage = () => {
    if (!socket || !activeChannel || !newMessage.trim()) return;

    const message: Message = {
      name: user.name,
      text: newMessage,
      time: new Intl.DateTimeFormat('default', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).format(new Date())
    };
    console.log("here")
    socket.emit('send_message', activeChannel, message, (response: any) => {
      if (response.success) {
        console.log("send_message was successful")
        setMessages(response.channel);
        setNewMessage('');
      } else {
        console.log("error")
        console.error(response.error);
      }
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
            messages={messages}
            newMessage={newMessage}
            onMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
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
  messages = [], // Add a default value here
  newMessage,
  onMessageChange,
  onSendMessage,
}: {
  channel: Channel;
  messages: Message[];
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b-2 p-4">
        <h2 className="text-xl font-bold">{channel.name}</h2>
        {channel.members && channel.members.length > 0 ? (
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
            <div className="font-bold">{message.name}</div>
            <div>{message.text}</div>
            <div className="text-xs text-gray-600">{message.time}</div>
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
        <Button onClick={onSendMessage} className="flex-shrink-0 px-4 py-2 text-sm w-1/6">
          Send
        </Button>
      </div>
    </div>
  );
}
