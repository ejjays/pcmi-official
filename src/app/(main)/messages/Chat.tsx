import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "./useInitializeChatClient";

// TopBar Component: Displays a small bar at the top of the screen on mobile devices
function TopBar() {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-[2vh] bg-card z-20"></div>
  );
}

// BottomBar Component: Displays a small bar at the bottom of the screen on mobile devices
function BottomBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[2vh] bg-card z-20"></div>
  );
}

// Loading component with status
function LoadingState({ status }: { status: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: `hsl(var(--card))` }}
    >
      <Loader2 className="animate-spin" />
      <p className="text-sm text-muted-foreground">
        {status === 'connecting' ? 'Connecting to chat...' : 'Reconnecting...'}
      </p>
    </div>
  );
}

export default function Chat() {
  const chatClient = useInitializeChatClient();
  const { resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    if (chatClient) {
      chatClient.on('connection.changed', ({ online = false }) => {
        setConnectionStatus(online ? 'connected' : 'disconnected');
      });

      return () => {
        chatClient.off('connection.changed');
      };
    }
  }, [chatClient]);

  // Show loading state while initializing
  if (!chatClient) {
    return <LoadingState status={connectionStatus} />;
  }

  return (
    <main className="fixed inset-0 z-10 overflow-hidden bg-card md:relative md:w-full md:h-auto">
      <TopBar />
      <div className="absolute inset-0 flex pt-[2vh] pb-[2vh] md:pt-0 md:pb-0">
        <StreamChat
          client={chatClient}
          theme={resolvedTheme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"}
        >
          <ChatSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <ChatChannel
            open={!sidebarOpen}
            openSidebar={() => setSidebarOpen(true)}
          />
        </StreamChat>
      </div>
      <BottomBar />
      
      {/* Connection status indicator */}
      {connectionStatus === 'disconnected' && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm">
          Connection lost. Reconnecting...
        </div>
      )}
    </main>
  );
}