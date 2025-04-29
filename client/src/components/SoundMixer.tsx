import { soundTracks } from '@shared/schema';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/lib/audioContext';
import { cn } from '@/lib/utils';
import { LockIcon, UnlockIcon, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mapping for material icons to Lucide icons using their text names
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'water_drop':
      return <span className="material-icons text-[#00BFA5] mr-2">water_drop</span>;
    case 'waves':
      return <span className="material-icons text-[#00BFA5] mr-2">waves</span>;
    case 'flutter_dash':
      return <span className="material-icons text-[#00BFA5] mr-2">flutter_dash</span>;
    case 'air':
      return <span className="material-icons text-[#00BFA5] mr-2">air</span>;
    case 'thunderstorm':
      return <span className="material-icons text-[#00BFA5] mr-2">thunderstorm</span>;
    case 'shower':
      return <span className="material-icons text-[#00BFA5] mr-2">shower</span>;
    case 'local_fire_department':
      return <span className="material-icons text-[#00BFA5] mr-2">local_fire_department</span>;
    case 'pest_control':
      return <span className="material-icons text-[#00BFA5] mr-2">pest_control</span>;
    case 'music_note':
      return <span className="material-icons text-[#00BFA5] mr-2">music_note</span>;
    case 'wind_power':
      return <span className="material-icons text-[#00BFA5] mr-2">wind_power</span>;
    case 'public':
      return <span className="material-icons text-[#00BFA5] mr-2">public</span>;
    case 'audio_file':
      return <span className="material-icons text-[#00BFA5] mr-2">audio_file</span>;
    default:
      return <span className="material-icons text-[#00BFA5] mr-2">music_note</span>;
  }
};

export default function SoundMixer() {
  const { 
    tracks, 
    updateTrackVolume, 
    isPlaying, 
    isPresetActive,
    resetAllTracks,
    setCurrentMixName,
    setPresetActive
  } = useAudio();
  const { toast } = useToast();

  const handleSliderChange = (id: string, values: number[]) => {
    // Only allow changing volume if not playing a preset or if playing but preset is not active
    if (!isPresetActive || (isPresetActive && !isPlaying)) {
      const value = values[0];
      updateTrackVolume(id, value);
    }
  };

  const handleResetAll = () => {
    resetAllTracks();
    setCurrentMixName('My Mix');
    setPresetActive(false);

    toast({
      title: 'All Sliders Reset',
      description: 'All sound volumes have been reset to 0.',
      duration: 3000,
    });
  };

  return (
    <div className="mb-8">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">Sound Tracks</h2>
        <Button
          onClick={handleResetAll}
          variant="outline" 
          className="bg-[#2D2D2D] hover:bg-opacity-80 text-white border-gray-700 flex items-center"
          size="sm"
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          <span>Reset All</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {soundTracks.map((sound) => {
        const track = tracks.find(t => t.id === sound.id);
        const volume = track?.volume || 0;

        // Determine if slider should be disabled
        const isSliderDisabled = isPresetActive && isPlaying;

        return (
          <div
            key={sound.id}
            className={cn(
              "card rounded-lg p-4 shadow-lg transition-all relative hover:shadow-xl",
              volume > 0 ? "opacity-100" : "opacity-80",
              isSliderDisabled ? "cursor-not-allowed" : ""
            )}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                {getIconComponent(sound.icon)}
                <h3 className="font-poppins font-medium">{sound.name}</h3>
              </div>
              <div className="flex items-center">
                {isSliderDisabled && (
                  <LockIcon className="h-3.5 w-3.5 mr-2 text-amber-500" />
                )}
                <span className="text-[#BBBBBB] text-sm">{volume}%</span>
              </div>
            </div>
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              disabled={isSliderDisabled}
              onValueChange={(values) => handleSliderChange(sound.id, values)}
              className={cn(
                "w-full",
                volume > 0 ? "opacity-100" : "opacity-70",
                isSliderDisabled ? "opacity-50 cursor-not-allowed" : ""
              )}
            />
          </div>
        );
      })}
      </div>
    </div>
  );
}