import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function WelcomeGuide() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show guide only on first visit
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      setIsOpen(true);
      localStorage.setItem('hasSeenGuide', 'true');
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#1E1E1E] text-white max-w-2xl flex flex-col h-[80vh]">
        <DialogHeader>
          <DialogTitle>Welcome to Yogtastic-Zen! 🎵</DialogTitle>
          <DialogDescription className="text-[#BBBBBB]">
            Here's a quick guide to help you get started with our ambient sound mixer.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-4 py-4">
            <div>
              <h3 className="font-medium mb-2">1. Sound Tracks</h3>
              <p className="text-[#BBBBBB]">Adjust individual sound volumes using the sliders. Mix and match different sounds to create your perfect ambiance.</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. Preset Mixes</h3>
              <p className="text-[#BBBBBB]">Try our curated preset mixes for different moods and activities like Deep Sleep, Focus, or Meditation.</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Playback Controls</h3>
              <p className="text-[#BBBBBB]">Use the play/pause button to control playback. Set a sleep timer if you want the sounds to stop automatically.</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">4. Save Your Mixes</h3>
              <p className="text-[#BBBBBB]">Create your perfect mix? Click 'Save Mix' to store it for future use. Your saved mixes will appear in the 'Your Saved Mixes' section.</p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button onClick={() => setIsOpen(false)} className="bg-primary hover:bg-opacity-80">
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
