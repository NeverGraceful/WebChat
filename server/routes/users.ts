import { Router, Request, Response } from 'express';
import { Server } from 'socket.io';

const router = Router();

interface User {
  id: string;
  name: string;
}

const users: User[] = [];
const TOKEN_USER_ID_MAP = new Map<string, string>();

router.post('/signup', (req: Request, res: Response) => {
  const { id, name } = req.body;
  console.log('Received signup request:', { id, name });

  if (!id || !name) {
    console.log('Invalid input');
    return res.status(400).send('Invalid input');
  }

  const existingUser = users.find(user => user.id === id);
  if (existingUser) {
    console.log('User ID taken:', id);
    return res.status(400).send('User ID taken');
  }

  const newUser: User = { id, name };
  users.push(newUser);
  console.log('User signed up successfully:', newUser);
  res.send({
    user: { name: newUser.name, id: newUser.id },
  });
});

router.post('/login', (req: Request, res: Response) => {
  const { id } = req.body;
  console.log('Received login request:', { id });
  if (!id) {
    return res.status(400).send('Invalid input');
  }

  const user = users.find(user => user.id === id);
  if (!user) {
    console.log('Invalid input');
    return res.status(401).send('User not found');
  }

  const token = `${id}-${new Date().getTime()}`; 
  TOKEN_USER_ID_MAP.set(token, user.id);

  res.send({
    token,
    user: { name: user.name, id: user.id },
  });
});

router.post('/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).send('Invalid input');
  }

  const id = TOKEN_USER_ID_MAP.get(token);
  if (!id) {
    return res.status(400).send('Invalid token');
  }

  TOKEN_USER_ID_MAP.delete(token);
  res.send('User logged out');
});

export { router as userRoutes };
