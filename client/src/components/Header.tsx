import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Timer } from 'lucide-react';
import SaveMixModal from './SaveMixModal';

interface HeaderProps {
  onTimerClick: () => void;
}

export default function Header({ onTimerClick }: HeaderProps) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const openSaveModal = () => {
    setIsSaveModalOpen(true);
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
  };

  return (
    <header className="bg-[#1E1E1E] py-4 px-6 shadow-md">
    
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="font-['Montserrat'] font-semibold text-xl bg-gradient-to-r from-[#00BFA5] to-[#7C4DFF] text-transparent bg-clip-text">Yogtastic-Zen</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={openSaveModal}
            className="bg-primary hover:bg-opacity-80 text-white flex items-center"
          >
            <Save className="mr-1 h-4 w-4" />
            <span>Save Mix</span>
          </Button>

        </div>
        
        <SaveMixModal isOpen={isSaveModalOpen} onClose={closeSaveModal} />
      </div>
    </header>
  );
}
