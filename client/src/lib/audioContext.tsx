import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { soundTracks } from '@shared/schema';

// Create proper AudioContext type to avoid Web Audio API context confusion
const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;

export interface AudioTrack {
  id: string;
  name: string;
  icon: string;
  volume: number;
  gainNode: GainNode | null;
  audioElement: HTMLAudioElement | null;
  source: MediaElementAudioSourceNode | null;
}

export interface SoundSettings {
  [key: string]: number;
}

export interface TimerState {
  isActive: boolean;
  minutes: number | null;
  endTime: Date | null;
  timeRemaining: number | null;
}

interface AudioContextValue {
  tracks: AudioTrack[];
  audioContext: AudioContext | null;
  isPlaying: boolean;
  isPresetActive: boolean;
  currentMix: {
    name: string;
    settings: SoundSettings;
  };
  timer: TimerState;
  togglePlayback: () => void;
  updateTrackVolume: (trackId: string, volume: number) => void;
  setAllTrackVolumes: (settings: SoundSettings) => void;
  resetAllTracks: () => void;
  setCurrentMixName: (name: string) => void;
  setTimer: (minutes: number | null) => void;
  clearTimer: () => void;
  setPresetActive: (active: boolean) => void;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPresetActive, setIsPresetActive] = useState(false);
  const [currentMix, setCurrentMix] = useState({
    name: 'My Mix',
    settings: {} as SoundSettings
  });
  const [timer, setTimerState] = useState<TimerState>({
    isActive: false,
    minutes: null, 
    endTime: null,
    timeRemaining: null
  });
  
  const timerRef = useRef<number | null>(null);

  // Initialize audio context and tracks
  useEffect(() => {
    const initAudio = async () => {
      try {
        console.log("Initializing audio context...");
        // Create audio context
        const ctx = new AudioCtx();
        setAudioContext(ctx);
        
        // Setup initial tracks
        const initialTracks = soundTracks.map(track => {
          // Create gain node
          const gainNode = ctx.createGain();
          gainNode.gain.value = 0; // Start with zero volume
          gainNode.connect(ctx.destination);
          
          // Create audio element - map our track IDs to the actual filenames in the Audio folder
          let filename = '';
          switch(track.id) {
            case 'rainfall': filename = 'Rain.mp3'; break;
            case 'ocean': filename = 'Ocean.mp3'; break;
            case 'birds': filename = 'Birds.mp3'; break;
            case 'wind': filename = 'Wind.mp3'; break;
            case 'thunder': filename = 'Thunderstorm.mp3'; break;
            case 'river': filename = 'River.mp3'; break;
            case 'fire': filename = 'Campfire.mp3'; break;
            case 'insects': filename = 'Cricket.mp3'; break;
            case 'bowl': filename = 'Bowl.mp3'; break;
            case 'chimes': filename = 'Chimes.mp3'; break;
            case 'space': filename = 'Space.mp3'; break;
            case 'flute': filename = 'Flute.mp3'; break;
            default: filename = `${track.id}.mp3`;
          }
          const audioElement = new Audio(`/sounds/${filename}`);
          console.log(`Loading audio: /sounds/${filename}`);
          audioElement.loop = true;
          
          // Create media source
          const source = ctx.createMediaElementSource(audioElement);
          source.connect(gainNode);
          
          // Add to tracks array
          return {
            id: track.id,
            name: track.name,
            icon: track.icon,
            volume: 0,
            gainNode,
            audioElement,
            source
          };
        });
        
        setTracks(initialTracks);
        
        // Set initial settings
        const initialSettings: SoundSettings = {};
        initialTracks.forEach(track => {
          initialSettings[track.id] = 0;
        });
        
        setCurrentMix(prev => ({
          ...prev,
          settings: initialSettings
        }));
        
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
        alert('Error initializing audio system. Please reload the page and try again.');
      }
    };

    initAudio().catch(err => {
      console.error('Error in initAudio:', err);
    });
    
    // Cleanup
    return () => {
      tracks.forEach(track => {
        if (track.audioElement) {
          track.audioElement.pause();
          track.audioElement.src = '';
        }
      });
      
      if (audioContext) {
        audioContext.close();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    if (!audioContext) return;
    
    tracks.forEach(track => {
      if (track.audioElement) {
        if (isPlaying) {
          track.audioElement.play().catch(err => {
            console.error(`Error playing ${track.id}:`, err);
            
            // If user hasn't interacted with the page yet, this will likely fail
            // We'll set isPlaying back to false
            if (err.name === 'NotAllowedError') {
              setIsPlaying(false);
            }
          });
        } else {
          track.audioElement.pause();
        }
      }
    });
  }, [isPlaying, tracks, audioContext]);
  
  // Handle timer
  useEffect(() => {
    if (timer.isActive && timer.endTime) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Update time remaining every second
      timerRef.current = window.setInterval(() => {
        const now = new Date();
        const timeRemaining = Math.max(0, timer.endTime!.getTime() - now.getTime());
        
        if (timeRemaining <= 0) {
          // Timer completed
          clearInterval(timerRef.current!);
          setIsPlaying(false);
          setTimerState({
            isActive: false,
            minutes: null,
            endTime: null,
            timeRemaining: null
          });
        } else {
          setTimerState(prev => ({
            ...prev,
            timeRemaining
          }));
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timer.isActive, timer.endTime]);

  const togglePlayback = () => {
    // Resume audio context if it's suspended
    if (audioContext?.state === 'suspended') {
      audioContext.resume();
    }
    
    setIsPlaying(prev => !prev);
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    if (!audioContext) return;
    
    // If preset is active and user is changing volume, reset to "My Mix"
    if (isPresetActive) {
      setIsPresetActive(false);
      setCurrentMixName('My Mix');
    }
    
    // Update the track volume
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        if (track.id === trackId) {
          if (track.gainNode) {
            // Convert 0-100 range to 0-1 range for gain
            track.gainNode.gain.value = volume / 100;
          }
          return { ...track, volume };
        }
        return track;
      });
    });
    
    // Update current mix settings
    setCurrentMix(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [trackId]: volume
      }
    }));
  };

  const setAllTrackVolumes = (settings: SoundSettings) => {
    if (!audioContext) return;
    
    // Update all track volumes based on settings
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const volume = settings[track.id] || 0;
        if (track.gainNode) {
          // Convert 0-100 range to 0-1 range for gain
          track.gainNode.gain.value = volume / 100;
        }
        return { ...track, volume };
      });
    });
    
    // Update current mix settings
    setCurrentMix(prev => ({
      ...prev,
      settings
    }));
  };

  const resetAllTracks = () => {
    // Reset all track volumes to 0
    const resetSettings: SoundSettings = {};
    tracks.forEach(track => {
      resetSettings[track.id] = 0;
    });
    
    setAllTrackVolumes(resetSettings);
  };

  const setCurrentMixName = (name: string) => {
    setCurrentMix(prev => ({
      ...prev,
      name
    }));
  };

  const setTimer = (minutes: number | null) => {
    if (!minutes) {
      clearTimer();
      return;
    }
    
    const now = new Date();
    const endTime = new Date(now.getTime() + minutes * 60 * 1000);
    
    setTimerState({
      isActive: true,
      minutes,
      endTime,
      timeRemaining: minutes * 60 * 1000
    });
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimerState({
      isActive: false,
      minutes: null,
      endTime: null,
      timeRemaining: null
    });
  };
  
  const setPresetActive = (active: boolean) => {
    setIsPresetActive(active);
  };

  return (
    <AudioContext.Provider
      value={{
        tracks,
        audioContext,
        isPlaying,
        isPresetActive,
        currentMix,
        timer,
        togglePlayback,
        updateTrackVolume,
        setAllTrackVolumes,
        resetAllTracks,
        setCurrentMixName,
        setTimer,
        clearTimer,
        setPresetActive
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
