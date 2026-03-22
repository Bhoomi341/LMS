export {};

declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }

  namespace YT {
    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }

    interface PlayerOptions {
      height?: string | number;
      width?: string | number;
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: Player }) => void;
        onStateChange?: (e: { data: PlayerState; target: Player }) => void;
      };
    }

    class Player {
      constructor(elId: string, options: PlayerOptions);
      destroy(): void;
      getCurrentTime(): number;
      seekTo(seconds: number, allowSeekAhead?: boolean): void;
      getPlayerState(): PlayerState;
    }
  }
}
