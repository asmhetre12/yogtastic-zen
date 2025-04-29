import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LibraryBig, Edit, Trash } from 'lucide-react';
import { useAudio } from '@/lib/audioContext';
import { SoundPreset } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function SavedMixes() {
  const { setAllTrackVolumes, setCurrentMixName, setPresetActive, isPlaying } = useAudio();
  const { toast } = useToast();
  const [deletePresetId, setDeletePresetId] = useState<number | null>(null);

  const { data: savedPresets, isLoading } = useQuery<SoundPreset[]>({
    queryKey: ['/api/presets'],
    select: (data) => data.filter(preset => preset.isDefault === 0)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/presets/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presets'] });
      toast({
        title: 'Mix Deleted',
        description: 'Your saved mix has been deleted.'
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete mix: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  const handlePresetClick = (preset: SoundPreset, e: React.MouseEvent) => {
    // Check if the click was on a button
    const target = e.target as HTMLElement;
    const isButton = target.closest('button');
    
    if (isButton) return;
    
    // Apply the preset settings to all tracks
    setAllTrackVolumes(preset.settings as Record<string, number>);
    
    // Update the mix name to the preset name
    setCurrentMixName(preset.name);
    
    // Set preset as active - this will lock sliders if playing
    setPresetActive(true);
    
    toast({
      title: 'Mix Loaded',
      description: `"${preset.name}" has been loaded. ${
        isPlaying 
          ? 'Sliders are locked during playback of presets.' 
          : 'Press play to start with locked sliders.'
      }`
    });
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletePresetId(id);
  };

  const confirmDelete = () => {
    if (deletePresetId !== null) {
      deleteMutation.mutate(deletePresetId);
      setDeletePresetId(null);
    }
  };

  const cancelDelete = () => {
    setDeletePresetId(null);
  };

  // Get top 3 sounds from a preset
  const getTopSounds = (settings: Record<string, number>) => {
    return Object.entries(settings)
      .filter(([_, value]) => value > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key);
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="font-poppins font-medium text-xl mb-4">Your Saved Mixes</h2>
        <Card className="bg-[#1E1E1E] animate-pulse h-[120px]">
          <CardContent className="p-4"></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-poppins font-medium text-xl mb-4">Your Saved Mixes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!savedPresets || savedPresets.length === 0 ? (
          <div className="col-span-full text-center py-6 bg-[#1E1E1E] rounded-lg">
            <LibraryBig className="mx-auto h-10 w-10 text-[#BBBBBB] mb-2" />
            <p className="text-[#BBBBBB]">You haven't saved any mixes yet.</p>
            <p className="text-sm text-[#BBBBBB] mt-2">Create your perfect combination and click "Save Mix" to store it here.</p>
          </div>
        ) : (
          savedPresets.map((preset) => {
            const topSounds = getTopSounds(preset.settings as Record<string, number>);
            
            return (
              <Card 
                key={preset.id}
                className="bg-[#1E1E1E] rounded-lg shadow-md hover:shadow-lg transition cursor-pointer border border-transparent hover:border-primary"
                onClick={(e) => handlePresetClick(preset, e)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-poppins font-medium">{preset.name}</h3>
                    <div className="flex">
                      <button 
                        className="text-[#BBBBBB] hover:text-primary mr-2" 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit functionality
                          setAllTrackVolumes(preset.settings as Record<string, number>);
                          // Set name as My Mix to indicate it's being edited
                          setCurrentMixName('My Mix');
                          // Deactivate preset mode
                          setPresetActive(false);
                          
                          toast({
                            title: 'Editing Mix',
                            description: 'Adjust the sliders to customize this mix, then save it with a new name.',
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-[#BBBBBB] hover:text-red-500" 
                        onClick={(e) => handleDelete(preset.id, e)}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[#BBBBBB] text-sm mb-3">Your custom mix</p>
                  <div className="flex flex-wrap gap-1">
                    {topSounds.map((sound) => (
                      <Badge key={sound} variant="outline" className="bg-[#2D2D2D] hover:bg-[#2D2D2D] border-0 text-xs">
                        {sound}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AlertDialog open={deletePresetId !== null} onOpenChange={() => setDeletePresetId(null)}>
        <AlertDialogContent className="bg-[#1E1E1E] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Mix</AlertDialogTitle>
            <AlertDialogDescription className="text-[#BBBBBB]">
              Are you sure you want to delete this mix? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} className="bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] border-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
