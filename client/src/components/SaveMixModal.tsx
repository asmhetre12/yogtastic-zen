import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAudio } from '@/lib/audioContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SaveMixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SaveMixModal({ isOpen, onClose }: SaveMixModalProps) {
  const [mixName, setMixName] = useState('');
  const { currentMix } = useAudio();
  const { toast } = useToast();
  
  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/presets', {
        name: mixName.trim(),
        description: 'Your custom mix',
        settings: currentMix.settings
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presets'] });
      onClose();
      setMixName('');
      toast({
        title: 'Mix Saved',
        description: `Your mix "${mixName}" has been saved!`
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to save mix: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
  
  const handleSave = () => {
    if (!mixName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a name for your mix'
      });
      return;
    }
    
    saveMutation.mutate();
  };
  
  const handleCancel = () => {
    setMixName('');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1E1E1E] text-white">
        <DialogHeader>
          <DialogTitle>Save Your Mix</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Label htmlFor="mix-name" className="block text-sm font-medium mb-2">Mix Name</Label>
          <Input
            id="mix-name"
            value={mixName}
            onChange={(e) => setMixName(e.target.value)}
            placeholder="Enter a name for your mix"
            className="w-full px-4 py-2 rounded-lg bg-[#2D2D2D] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-gray-700 hover:bg-[#2D2D2D]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-primary hover:bg-opacity-80"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Mix'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
