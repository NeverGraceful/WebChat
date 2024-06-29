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

export function Channel() {
  const { user } = useLoggedInAuth();
  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef<HTMLInputElement>(null);
  const memberIdsRef = useRef<SelectInstance<{ label: string; value: string }>>(null);

  const createChannel = useMutation({
    mutationFn: ({ name, memberIds, imageUrl }: { name: string, memberIds: string[], imageUrl?: string }) => {
      return new Promise<void>((resolve, reject) => {
        socket.emit('create_channel', { name, memberIds, imageUrl, creatorId: user.id }, (response: any) => {
          if (response.success) {
            resolve();
          } else {
            reject(response.error);
          }
        });
      });
    },
    onSuccess() {
      navigate("/");
    },
  });

  const users = useQuery({
    queryKey: ["socket", "users"],
    queryFn: () => {
      return new Promise<any>((resolve, reject) => {
        socket.emit('get_users', { excludeId: user.id }, (response: any) => {
          if (response.success) {
            resolve(response.users);
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
    const imageUrl = imageUrlRef.current?.value;
    const selectOptions = memberIdsRef.current?.getValue();
    if (!name || !selectOptions || selectOptions.length === 0) {
      return;
    }

    createChannel.mutate({
      name,
      imageUrl,
      memberIds: selectOptions.map(option => option.value),
    });
  }

  useEffect(() => {
    return () => {
      socket.off('get_users');
      socket.off('create_channel');
    };
  }, []);

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
          <label htmlFor="imageUrl">Image Url</label>
          <Input id="imageUrl" ref={imageUrlRef} />
          <label htmlFor="members">Members</label>
          <Select
            ref={memberIdsRef}
            id="members"
            required
            isMulti
            classNames={{ container: () => "w-full" }}
            isLoading={users.isPending}
            options={users.data?.map((user: any) => {
              return { value: user.id, label: user.name || user.id };
            })}
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
