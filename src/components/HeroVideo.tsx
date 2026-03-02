"use client";
import { useEffect, useRef } from 'react';

export default function HeroVideo() {
    const playerRef = useRef<any>(null);

    useEffect(() => {
        const initPlayer = () => {
            if (typeof window !== 'undefined' && (window as any).YT && (window as any).YT.Player) {
                playerRef.current = new (window as any).YT.Player('youtube-player', {
                    videoId: 'gU00NwWoG8w',
                    playerVars: {
                        autoplay: 1,
                        mute: 1,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        modestbranding: 1,
                        playsinline: 1,
                        rel: 0,
                        showinfo: 0,
                        start: 30,
                        end: 55,
                        enablejsapi: 1,
                        iv_load_policy: 3,
                    },
                    events: {
                        onReady: (event: any) => {
                            event.target.mute();
                            event.target.playVideo();
                        },
                        onStateChange: (event: any) => {
                            if (event.data === 0) {
                                event.target.loadVideoById({
                                    videoId: 'gU00NwWoG8w',
                                    startSeconds: 30,
                                    endSeconds: 55
                                });
                            }
                        }
                    }
                });
            } else {
                setTimeout(initPlayer, 100);
            }
        };

        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }

        const timer = setTimeout(initPlayer, 500);
        return () => {
            clearTimeout(timer);
            if (playerRef.current) playerRef.current.destroy();
        };
    }, []);

    return (
        <div className="w-full h-full overflow-hidden absolute inset-0 pointer-events-none bg-slate-900 z-0">
            <div
                id="youtube-player"
                className="w-full h-full object-cover scale-[2.5] opacity-40 transition-opacity duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b1222]/80 via-transparent to-[#0b1222] z-[1]" />
        </div>
    );
}
