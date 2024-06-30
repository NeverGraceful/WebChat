import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useLocalStorage } from "../hooks/useLocalStorage";

type AuthContext = {
  user?: User;
  socket?: Socket;
  signup: UseMutationResult<AxiosResponse, unknown, User>;
  login: UseMutationResult<{ token: string; user: User }, unknown, string>;
  logout: UseMutationResult<AxiosResponse, unknown, void>;
};

type User = {
  id: string;
  name: string;
};

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
  const [token, setToken] = useLocalStorage<string>("token");
  const [socket, setSocket] = useState<Socket | undefined>();

  const signup = useMutation({
    mutationFn: (user: User) => {
      return axios.post(`${import.meta.env.VITE_SERVER_URL}/api/signup`, user);
    },
    onSuccess() {
      navigate("/login");
    },
  });

  const login = useMutation({
    mutationFn: (id: string) => {
      return axios.post(`${import.meta.env.VITE_SERVER_URL}/api/login`, { id })
        .then(res => res.data as { token: string; user: User });
    },
    onSuccess(data) {
      setUser(data.user);
      setToken(data.token);
    },
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
    <Context.Provider value={{ signup, login, user, socket, logout }}>
      {children}
    </Context.Provider>
  );
}
