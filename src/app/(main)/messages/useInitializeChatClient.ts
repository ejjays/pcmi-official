import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";
import { useQuery } from '@tanstack/react-query'; 


let clientInstance: StreamChat | null = null;

export default function useInitializeChatClient() {
  const { user } = useSession();
  
  // Use React Query for caching
  const { data: chatClient } = useQuery({
    queryKey: ['chat-client', user.id],
    queryFn: async () => {
      if (!clientInstance) {
        clientInstance = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);
      }

      const cachedToken = localStorage.getItem('stream-chat-token');
      
      const token = cachedToken || await kyInstance
        .get("/api/get-token")
        .json<{ token: string }>()
        .then((data) => {
          localStorage.setItem('stream-chat-token', data.token);
          return data.token;
        });

      await clientInstance.connectUser(
        {
          id: user.id,
          username: user.username,
          name: user.displayName,
          image: user.avatarUrl,
        },
        token
      );

      return clientInstance;
    },
    staleTime: 1000 * 60 * 30, // Keep the data fresh for 30 minutes
    cacheTime: 1000 * 60 * 60, // Cache the data for 1 hour
  });

  return chatClient;
}