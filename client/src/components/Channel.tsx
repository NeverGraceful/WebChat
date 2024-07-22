import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useRef, useEffect } from "react";
import { Button } from "./Button";
import { AuthCard } from "./AuthCard";
import { Input } from "./Input";
import { Link } from "./Link";
import Select, { SelectInstance } from "react-select";
import { useLoggedInAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_SERVER_URL);

interface User {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  name: string;
  memberIds: string[];
  creatorId: string;
}

export function Channel() {
  const { user, createChannel } = useLoggedInAuth();
  // const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement>(null);
  const memberIdsRef = useRef<SelectInstance<{ label: string; value: string }>>(null);

  // const createChannel = useMutation({
  //   mutationFn: ({ name, memberIds }: { name: string, memberIds: string[] }) => {
  //     return new Promise<void>((resolve, reject) => {
  //       socket.emit('create_channel', { name, memberIds, creatorId: user.id }, (response: any) => {
  //         if (response.success) {
  //           resolve();
            
  //         } else {
  //           reject(response.error);
  //         }
  //       });
  //     });
  //   },
  //   onSuccess() {
  //     navigate("/");
  //   },
  //   onError(error) {
  //     console.error("Failed to create channel:", error);
  //     alert("Failed to create channel. Please try again.");
  //   }
  // });

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["socket", "users", user.id],
    queryFn: () => {
      return new Promise<User[]>((resolve, reject) => {
        socket.emit('get_users', (response: any) => {
          if (response.success) {
            resolve(response.users);
            console.log("Users: ",users)
          } else {
            reject(response.error);
          }
        });
      });
    },
    enabled: true,
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const name = nameRef.current?.value;
    const selectOptions = memberIdsRef.current?.getValue();
    if (!name || !selectOptions || selectOptions.length === 0) {
      return;
    }

    const generateChannelId = (): string => {
      return Math.random().toString(36).substring(2, 15);
    };

    const memberIds = selectOptions.map(option => option.value);
    let allMemberIds: string[] = [];
    allMemberIds.push(user.id);
    allMemberIds.push(...memberIds);

    const newChannel: Channel = { id: generateChannelId(), name, memberIds: allMemberIds, creatorId: user.id};

    createChannel.mutate(newChannel);
  }

  useEffect(() => {
    return () => {
      socket.off('get_users');
      // socket.off('create_channel');
    };
  }, []);

  if (usersError) {
    return <div>Error loading users: {usersError.message}</div>;
  }

  const channelMemberOptions = users?.map((userItem: User) => {
    if (userItem.id === user.id) {
      return null;
    }
    return { value: userItem.id, label: userItem.name || userItem.id };
  }).filter(option => option !== null);

  return (
    <AuthCard>
      <AuthCard.body>
        <h1 className="text-3xl font-bold mb-8 text-center">
          New Conversation
        </h1>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-5 items-center justify-items-end"
        >
          <label htmlFor="name">Name</label>
          <Input id="name" required ref={nameRef} />
          <label htmlFor="members">Members</label>
          <Select
            ref={memberIdsRef}
            id="members"
            required
            isMulti
            classNames={{ container: () => "w-full" }}
            isLoading={ usersLoading }
            options={ channelMemberOptions }
          />
          <Button
            disabled={createChannel.isPending}
            type="submit"
            className="col-span-full"
          >
            {createChannel.isPending ? "Loading.." : "Create"}
          </Button>
        </form>
      </AuthCard.body>
      <AuthCard.below>
        <Link to="/">Back</Link>
      </AuthCard.below>
    </AuthCard>
  );
}
