import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Moon, RotateCcw } from 'lucide-react';
import { useAudio } from '@/lib/audioContext';
import { 
  TimerSelect,
  TimerSelectTrigger,
  TimerSelectContent,
  TimerSelectItem,
  TimerSelectValue,
} from '@/components/ui/timer-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function PlaybackControls() {
  const { 
    isPlaying, 
    togglePlayback, 
    currentMix, 
    timer, 
    setTimer, 
    clearTimer,
    isPresetActive,
    resetAllTracks,
    setCurrentMixName,
    setPresetActive
  } = useAudio();
  const [customTimerModalOpen, setCustomTimerModalOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [timerDisplay, setTimerDisplay] = useState('No Timer');
  const { toast } = useToast();
  
  // Format the time remaining
  useEffect(() => {
    if (!timer.isActive || timer.timeRemaining === null) {
      setTimerDisplay('No Timer');
      return;
    }
    
    const totalSeconds = Math.floor(timer.timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    setTimerDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }, [timer]);
  
  const handleTimerChange = (value: string) => {
    if (value === 'none') {
      clearTimer();
    } else if (value === 'custom') {
      setCustomTimerModalOpen(true);
    } else {
      const minutes = parseInt(value);
      if (!isNaN(minutes)) {
        setTimer(minutes);
        toast({
          title: 'Sleep Timer Set',
          description: `Playback will stop in ${minutes} minutes`,
        });
      }
    }
  };
  
  const handleCustomTimerSet = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
      setTimer(minutes);
      setCustomTimerModalOpen(false);
      setCustomMinutes('');
      toast({
        title: 'Custom Sleep Timer Set',
        description: `Playback will stop in ${minutes} minutes`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Time',
        description: 'Please enter a valid time between 1 and 180 minutes',
      });
    }
  };
  
  return (
    <div className="bg-[#1E1E1E] rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Button
            onClick={() => {
              togglePlayback();
              // Display a toast message if we're locking/unlocking a preset
              if (isPresetActive) {
                toast({
                  title: isPlaying ? 'Preset Paused' : 'Preset Playing',
                  description: isPlaying 
                    ? 'Sliders are now unlocked for customization' 
                    : 'Sliders are locked during preset playback',
                  duration: 3000,
                });
              }
            }}
            className="bg-primary hover:bg-opacity-80 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition mr-4"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
          <div>
            <h2 className="font-poppins font-medium text-lg">Now Playing</h2>
            <p className="text-[#BBBBBB] text-sm">
              {currentMix.name === 'My Mix' ? 'Custom Mix' : currentMix.name}
              {' '}- {isPlaying ? 'Playing' : 'Paused'} ∞
              {isPresetActive && isPlaying && <span className="ml-2 text-amber-500">(Locked)</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-[#2D2D2D] px-4 py-2 rounded-lg flex items-center backdrop-blur-sm border border-white/10">
            <Moon className="text-[#00BFA5] mr-2 h-4 w-4" />
            <span>{timerDisplay}</span>
          </div>
          
          <TimerSelect onValueChange={handleTimerChange}>
            <TimerSelectTrigger className="w-[160px]">
              <TimerSelectValue placeholder="Set Timer" />
            </TimerSelectTrigger>
            <TimerSelectContent>
              <TimerSelectItem value="none">No Timer</TimerSelectItem>
              <TimerSelectItem value="15">15 Minutes</TimerSelectItem>
              <TimerSelectItem value="30">30 Minutes</TimerSelectItem>
              <TimerSelectItem value="45">45 Minutes</TimerSelectItem>
              <TimerSelectItem value="60">60 Minutes</TimerSelectItem>
              <TimerSelectItem value="custom">Custom...</TimerSelectItem>
            </TimerSelectContent>
          </TimerSelect>
        </div>
      </div>
      
      {/* Custom Timer Dialog */}
      <Dialog open={customTimerModalOpen} onOpenChange={setCustomTimerModalOpen}>
        <DialogContent className="bg-[#1E1E1E] text-white">
          <DialogHeader>
            <DialogTitle>Set Custom Sleep Timer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="custom-timer">Minutes (1-180)</Label>
              <Input
                id="custom-timer"
                type="number"
                min="1"
                max="180"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="bg-[#2D2D2D] border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomTimerModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomTimerSet}>
              Set Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
