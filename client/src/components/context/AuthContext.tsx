import { useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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
      console.log('Signing up user:', user);
      return axios.post(`${import.meta.env.VITE_SERVER_URL}/api/signup`, user);
    },
    onSuccess() {
      console.log('Signup successful');
      navigate("/login");
    },
  });

  const login = useMutation({
    mutationFn: (id: string) => {
      console.log('Logging in user with ID:', id);
      return axios
        .post(`${import.meta.env.VITE_SERVER_URL}/api/login`, { id })
        .then(res => {
          console.log('Login response:', res.data);
          return res.data as { token: string; user: User };
        });
    },
    onSuccess(data) {
      console.log('Login successful:', data);
      setUser(data.user);
      setToken(data.token);
    },
  });

  const logout = useMutation({
    mutationFn: () => {
      console.log('Logging out');
      return axios.post(`${import.meta.env.VITE_SERVER_URL}/logout`, { token });
    },
    onSuccess() {
      console.log('Logout successful');
      setUser(undefined);
      setToken(undefined);
      setSocket(undefined);
    },
  });

  useEffect(() => {
    if (token == null || user == null) return;

    console.log('Attempting to connect to socket with token:', token);
    console.log('Attempting to connect to socket with user:', user);

    const newSocket = io(import.meta.env.VITE_SERVER_URL, {
      auth: { token },
    });

    return () => {
      console.log('Disconnecting socket');
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