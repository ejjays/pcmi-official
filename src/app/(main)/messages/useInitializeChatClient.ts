import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";

// Create a singleton instance
let clientInstance: StreamChat | null = null;

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeChat() {
      try {
        // Reuse existing instance or create new one
        if (!clientInstance) {
          clientInstance = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);
        }

        // Get cached token if available
        const cachedToken = localStorage.getItem('stream-chat-token');
        
        // Fetch new token if no cached token exists
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

        if (isMounted) {
          setChatClient(clientInstance);
        }
      } catch (error) {
        console.error("Failed to initialize chat", error);
      }
    }

    initializeChat();

    return () => {
      isMounted = false;
      if (clientInstance) {
        clientInstance
          .disconnectUser()
          .catch((error) => console.error("Failed to disconnect user", error));
      }
    };
  }, [user.id, user.username, user.displayName, user.avatarUrl]);

  return chatClient;
}