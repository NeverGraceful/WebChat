import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface AuthContext {
  user?: User;
  socket?: Socket;
  signup: UseMutationResult<{ user: User }, Error, User>;
  login: UseMutationResult<{ token: string; user: User }, Error, string>;
  logout: UseMutationResult<AxiosResponse, Error, void>;
  createChannel: UseMutationResult<any, Error, Channel>;
  clearStorage: any
};

interface User {
  id: string;
  name: string;
};

interface Channel {
  id: string;
  name: string;
  memberIds: string[];
  creatorId: string;
}

const Context = createContext<AuthContext | null>(null);

export function useAuth() {
  return useContext(Context) as AuthContext;
}

export function useLoggedInAuth() {
  return useContext(Context) as AuthContext & Required<Pick<AuthContext, "user">>;
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useLocalStorage<User>("user");
  const [users, setUsers] = useLocalStorage<User[]>("users", []);
  const [channels, setChannels] = useLocalStorage<Channel[]>("channels", []);
  const [token, setToken] = useLocalStorage<string>("token");
  const [socket, setSocket] = useState<Socket | undefined>();

  const signup = useMutation({
    mutationFn: (user: User) => {
      console.log("users: ", users);
      return axios.post<{ user: User }>(`${import.meta.env.VITE_SERVER_URL}/api/signup`, { id: user.id, name: user.name, users })
        .then(res => res.data);
    },
    onSuccess(data) {
      // Ensure no duplicates
      const updatedUsers = [...(users ?? []), data.user];
      const uniqueUsers = Array.from(new Set(updatedUsers.map(user => user?.id)))
        .map(id => updatedUsers.find(user => user?.id === id))
        .filter((user): user is User => user !== undefined); // Filter out undefined values
  
      setUsers(uniqueUsers);
      console.log("local users: ", uniqueUsers);
      navigate("/login");
    },
  });

  const login = useMutation({
    mutationFn: (id: string) => {
      return axios.post<{ token: string; user: User }>(`${import.meta.env.VITE_SERVER_URL}/api/login`, { id, users })
        .then(res => res.data);
    },
    onSuccess(data) {
      setUser(data.user);
      setToken(data.token);
    },
  });

  const createChannel = useMutation({
    mutationFn: (channel: Channel) => {
      return axios.post(`${import.meta.env.VITE_SERVER_URL}/api/channels`, { channel, channels }).then(res => res.data);
    },
    onSuccess(data) {
      // console.log("data.channels: ", data.channels)
      // const updatedChannels = [...(channels ?? []), data.channels];
      // console.log("updatedChannels: ", updatedChannels)
      setChannels(data.channels);
      console.log("local channels: ", channels);
      navigate("/");
    },
    onError(error) {
      console.error("Failed to create channel:", error);
      alert("Failed to create channel. Please try again.");
    }
  });

  const logout = useMutation({
    mutationFn: () => {
      return axios.post(`${import.meta.env.VITE_SERVER_URL}/api/logout`, { token });
    },
    onSuccess() {
      setUser(undefined);
      setToken(undefined);
      setSocket(undefined);
    },
  });

  // Temporary clear function for debugging purposes
  const clearStorage = () => {
    localStorage.clear();
    console.log('Local storage cleared');
    setUsers([]);
    setChannels([]);
  };

  useEffect(() => {
    if (token == null || user == null) return;

    const newSocket = io(import.meta.env.VITE_SERVER_URL, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocket(undefined);
    });

    return () => {
      newSocket.disconnect();
      setSocket(undefined);
    };
  }, [token, user]);

  return (
    <Context.Provider value={{ signup, login, user, socket, logout, createChannel, clearStorage }}>
      {children}
    </Context.Provider>
  );
}
