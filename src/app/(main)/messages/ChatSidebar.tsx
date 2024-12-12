import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { MailPlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import { useSession } from "../SessionProvider";
import NewChatDialog from "./NewChatDialog";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

function TopBar() {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-[2vh] bg-card z-20"></div>
  );
}

export default function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { channel } = useChatContext();

  useEffect(() => {
    if (channel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    }
  }, [channel?.id, queryClient]);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onClose();
        }}
      />
    ),
    [onClose]
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-30 bg-card transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <TopBar />
      <div className="pt-[2vh] h-full"> {/* Adds padding to push content below the TopBar */}
        <MenuHeader onClose={onClose} />
        <ChannelList
          filters={{
            type: "messaging",
            members: { $in: [user.id] },
          }}
          showChannelSearch
          options={{ state: true, presence: true, limit: 8 }}
          sort={{ last_message_at: -1 }}
          additionalChannelSearchProps={{
            searchForChannels: true,
            searchQueryParams: {
              channelFilters: {
                filters: { members: { $in: [user.id] } },
              },
            },
          }}
          Preview={ChannelPreviewCustom}
        />
      </div>
    </div>
  );
}

interface MenuHeaderProps {
  onClose: () => void;
}

function MenuHeader({ onClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="me-auto text-xl font-bold md:ms-2">Messages</h1>
        <Button
          size="icon"
          variant="ghost"
          title="Start new chat"
          onClick={() => setShowNewChatDialog(true)}
        >
          <MailPlus className="size-5" />
        </Button>
      </div>
      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onClose();
          }}
        />
      )}
    </>
  );
}