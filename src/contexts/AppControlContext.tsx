import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { TimelineEvent } from '../types';

interface MusicState {
    isPlaying: boolean;
    currentIndex: number;
    togglePlay: () => void;
    nextSong: () => void;
    prevSong: () => void;
    jumpToSong: (index: number) => void;
}

interface AppControlContextType {
    music: MusicState;
    timeline: {
        events: TimelineEvent[];
        scrollToEvent: (id: string) => void;
    };
    meta: {
        daysTogether: number;
    };
    ui: {
        openLightbox: (photoIndex: number) => void;
        closeLightbox: () => void;
        toggleTheme: () => void;
        scrollToSection: (section: 'timeline' | 'gallery' | 'comments' | 'footer') => void;
    }
    // Refs to be attached by components
    registerMusicControls: (controls: Omit<MusicState, 'currentIndex' | 'jumpToSong'>) => void;
    registerTimelineScroll: (fn: (id: string) => void) => void;
    registerUIControls: (controls: {
        openLightbox: (idx: number) => void;
        closeLightbox: () => void;
        toggleTheme: () => void;
        scrollToSection: (s: string) => void;
    }) => void;
    updateTimelineData: (events: TimelineEvent[]) => void;
    updateDaysTogether: (days: number) => void;
    setMusicIndex: (index: number) => void;
}

const AppControlContext = createContext<AppControlContextType | null>(null);

export const useAppControl = () => {
    const context = useContext(AppControlContext);
    if (!context) throw new Error('useAppControl must be used within AppControlProvider');
    return context;
};

export const AppControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Music State
    const [musicIndex, setMusicIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Refs for imperative handles
    const musicControlsRef = useRef<Omit<MusicState, 'currentIndex' | 'jumpToSong'>>({
        isPlaying: false,
        togglePlay: () => { },
        nextSong: () => { },
        prevSong: () => { },
    });

    const timelineScrollRef = useRef<(id: string) => void>(() => { });
    const uiControlsRef = useRef({
        openLightbox: (idx: number) => { },
        closeLightbox: () => { },
        toggleTheme: () => { },
        scrollToSection: (s: string) => { }
    });

    // Data State
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [daysTogether, setDaysTogether] = useState(0);

    const registerMusicControls = (controls: Omit<MusicState, 'currentIndex' | 'jumpToSong'>) => {
        musicControlsRef.current = controls;
        // Sync isPlaying state
        if (controls.isPlaying !== isPlaying) setIsPlaying(controls.isPlaying);
    };

    const registerTimelineScroll = (fn: (id: string) => void) => {
        timelineScrollRef.current = fn;
    };

    const registerUIControls = (controls: any) => {
        uiControlsRef.current = controls;
    };


    const jumpToSong = (index: number) => {
        setMusicIndex(index);
        // If not playing, maybe auto play? 
        if (!musicControlsRef.current.isPlaying) {
            musicControlsRef.current.togglePlay();
        }
    };

    const value: AppControlContextType = {
        music: {
            isPlaying,
            currentIndex: musicIndex,
            togglePlay: () => musicControlsRef.current.togglePlay(),
            nextSong: () => musicControlsRef.current.nextSong(),
            prevSong: () => musicControlsRef.current.prevSong(),
            jumpToSong
        },
        timeline: {
            events: timelineEvents,
            scrollToEvent: (id) => timelineScrollRef.current(id)
        },
        meta: {
            daysTogether
        },
        ui: {
            openLightbox: (idx) => uiControlsRef.current.openLightbox(idx),
            closeLightbox: () => uiControlsRef.current.closeLightbox(),
            toggleTheme: () => uiControlsRef.current.toggleTheme(),
            scrollToSection: (s) => uiControlsRef.current.scrollToSection(s)
        },
        registerMusicControls,
        registerTimelineScroll,
        registerUIControls,
        updateTimelineData: setTimelineEvents,
        updateDaysTogether: setDaysTogether,
        setMusicIndex
    };

    return (
        <AppControlContext.Provider value={value}>
            {children}
        </AppControlContext.Provider>
    );
};
