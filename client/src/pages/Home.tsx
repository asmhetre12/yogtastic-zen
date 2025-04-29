import { useState } from 'react';
import Header from '@/components/Header';
import PlaybackControls from '@/components/PlaybackControls';
import WelcomeGuide from '@/components/WelcomeGuide';
import SoundMixer from '@/components/SoundMixer';
import PresetMixes from '@/components/PresetMixes';
import SavedMixes from '@/components/SavedMixes';
import Footer from '@/components/Footer';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAudio } from '@/lib/audioContext';

export default function Home() {
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [timerOption, setTimerOption] = useState<string>('none');
  const [customMinutes, setCustomMinutes] = useState('');
  const { setTimer, clearTimer } = useAudio();
  
  const openTimerDialog = () => {
    setTimerDialogOpen(true);
  };
  
  const handleTimerSet = () => {
    if (timerOption === 'none') {
      clearTimer();
    } else if (timerOption === 'custom') {
      const minutes = parseInt(customMinutes);
      if (!isNaN(minutes) && minutes > 0) {
        setTimer(minutes);
      }
    } else {
      const minutes = parseInt(timerOption);
      if (!isNaN(minutes)) {
        setTimer(minutes);
      }
    }
    
    setTimerDialogOpen(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-[#FAFAFA]">
      <WelcomeGuide />
      <Header onTimerClick={openTimerDialog} />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <PlaybackControls />
        <SoundMixer />
        <PresetMixes />
        <SavedMixes />
      </main>
      
      <Footer />
      
      {/* Timer Dialog */}
      <Dialog open={timerDialogOpen} onOpenChange={setTimerDialogOpen}>
        <DialogContent className="bg-[#1E1E1E] text-white">
          <DialogHeader>
            <DialogTitle>Set Sleep Timer</DialogTitle>
            <DialogDescription className="text-[#BBBBBB]">
              Select when you want the audio to stop playing.
            </DialogDescription>
          </DialogHeader>
          
          <RadioGroup value={timerOption} onValueChange={setTimerOption} className="py-2">
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none">No Timer</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="15" id="r15" />
              <Label htmlFor="r15">15 Minutes</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="30" id="r30" />
              <Label htmlFor="r30">30 Minutes</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="45" id="r45" />
              <Label htmlFor="r45">45 Minutes</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="60" id="r60" />
              <Label htmlFor="r60">60 Minutes</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom</Label>
            </div>
            
            {timerOption === 'custom' && (
              <div className="ml-6 mt-2">
                <Label htmlFor="custom-minutes">Minutes (1-180)</Label>
                <Input
                  id="custom-minutes"
                  type="number"
                  min="1"
                  max="180"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-full mt-1 bg-[#2D2D2D] border-gray-700"
                />
              </div>
            )}
          </RadioGroup>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTimerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTimerSet}>
              Set Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
