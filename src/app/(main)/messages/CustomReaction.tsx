import { useState, useCallback, useRef, useEffect } from "react";
import { useChannelStateContext, useMessageContext, MessageSimple } from "stream-chat-react";
import { cn } from "@/lib/utils";
import { DefaultStreamChatGenerics } from "stream-chat-react";

interface CustomMessageProps {
  handleReaction?: (reactionType: string) => void;
}

const customReactionOptions = [
  {
    type: "love",
    Component: () => <>❤️</>,
    name: "Love",
  },
  {
    type: "like",
    Component: () => <>👍</>,
    name: "Like",
  },
  {
    type: "haha",
    Component: () => <>😂</>,
    name: "Haha",
  },
  {
    type: "wow",
    Component: () => <>😮</>,
    name: "Wow",
  },
  {
    type: "sad",
    Component: () => <>😢</>,
    name: "Sad",
  },
  {
    type: "angry",
    Component: () => <>😠</>,
    name: "Angry",
  },
];

const CustomMessage: React.FC<CustomMessageProps> = (props) => {
  const [showCustomReactions, setShowCustomReactions] = useState(false);
  const [useDefaultReactions, setUseDefaultReactions] = useState(true);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const touchStartTime = useRef<number>(0);
  const reactionsPanelRef = useRef<HTMLDivElement>(null);

  const { channel } = useChannelStateContext<DefaultStreamChatGenerics>();
  const { message } = useMessageContext<DefaultStreamChatGenerics>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionsPanelRef.current && 
        !reactionsPanelRef.current.contains(event.target as Node)
      ) {
        setShowCustomReactions(false);
        setUseDefaultReactions(true);
      }
    };

    if (showCustomReactions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomReactions]);

  const handleTouchStart = useCallback(() => {
    touchStartTime.current = Date.now();
    longPressTimer.current = setTimeout(() => {
      setShowCustomReactions(true);
      setUseDefaultReactions(false);
    }, 500);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (!showCustomReactions) {
      setUseDefaultReactions(true);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchEnd = useCallback(() => {
    const pressDuration = Date.now() - touchStartTime.current;
    if (pressDuration < 500) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        setUseDefaultReactions(true);
      }
    }
  }, []);

  const handleReactionClick = async (reactionType: string) => {
    try {
      const existing = message.own_reactions?.find(
        (reaction) => reaction.type === reactionType
      );

      if (existing) {
        await channel.deleteReaction(message.id, reactionType);
      } else {
        await channel.sendReaction(message.id, {
          type: reactionType,
        });
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
    setShowCustomReactions(false);
    setUseDefaultReactions(true);
  };

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <MessageSimple 
        {...props} 
        handleReaction={useDefaultReactions ? props.handleReaction : undefined}
      />
      
      {showCustomReactions && (
        <div 
          ref={reactionsPanelRef}
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
            "flex items-center gap-2 p-2.5",
            "bg-background/95 backdrop-blur-sm",
            "rounded-lg shadow-lg border border-border/50",
            "animate-in zoom-in-95 duration-200",
            "md:gap-3 md:p-3"
          )}
        >
          {customReactionOptions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReactionClick(reaction.type)}
              className={cn(
                "p-1.5 text-base hover:scale-115",
                "transition-all duration-200",
                "active:scale-90",
                "md:text-lg md:p-2"
              )}
            >
              <reaction.Component />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { CustomMessage, customReactionOptions };