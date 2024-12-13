import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";
import { useQuery } from '@tanstack/react-query'; 


let clientInstance: StreamChat | null = null;

export default function useInitializeChatClient() {
  const { user } = useSession();
  
  const { data: chatClient } = useQuery({
    queryKey: ['chat-client', user.id],
    queryFn: async () => {
      // If we already have a connected client, return it
      if (clientInstance?.userID === user.id) {
        return clientInstance;
      }

      // Initialize new client if needed
      if (!clientInstance) {
        clientInstance = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);
      }

      try {
        // Get token from localStorage or API
        const cachedToken = localStorage.getItem('stream-chat-token');
        const token = cachedToken || await kyInstance
          .get("/api/get-token")
          .json<{ token: string }>()
          .then((data) => {
            localStorage.setItem('stream-chat-token', data.token);
            return data.token;
          });

        // Connect user
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
      } catch (error) {
        console.error('Chat initialization error:', error);
        throw error;
      }
    },
    staleTime: Infinity, // Keep the data fresh forever until explicitly invalidated
    gcTime: Infinity,    // Never garbage collect the data
    retry: 1,           // Only retry once if failed
  });

  return chatClient;
}