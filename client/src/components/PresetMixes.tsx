import { useQuery } from '@tanstack/react-query';
import { useAudio } from '@/lib/audioContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Moon, Brain, Heart, Leaf, CloudRain, Flame } from 'lucide-react';
import { SoundPreset } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// Map preset IDs to Lucide icons
const presetIcons: Record<string, JSX.Element> = {
  'Deep Sleep': <Moon className="h-5 w-5 text-[#00BFA5]" />,
  'Focus': <Brain className="h-5 w-5 text-[#00BFA5]" />,
  'Zen Meditation': <Heart className="h-5 w-5 text-[#00BFA5]" />,
  'Forest Retreat': <Leaf className="h-5 w-5 text-[#00BFA5]" />,
  'Cosmic Chill': <CloudRain className="h-5 w-5 text-[#00BFA5]" />,
  'Campfire Dreams': <Flame className="h-5 w-5 text-[#00BFA5]" />
};

export default function PresetMixes() {
  const { 
    setAllTrackVolumes, 
    setCurrentMixName, 
    setPresetActive,
    isPlaying,
    togglePlayback
  } = useAudio();
  const { toast } = useToast();

  const { data: presets, isLoading, error } = useQuery<SoundPreset[]>({
    queryKey: ['/api/presets/default'],
  });

  const handlePresetClick = (preset: SoundPreset) => {
    // Apply the preset settings to all tracks
    setAllTrackVolumes(preset.settings as Record<string, number>);

    // Update the mix name to the preset name
    setCurrentMixName(preset.name);

    // Set preset as active - this will lock sliders if playing
    setPresetActive(true);

    // If not playing, start playback automatically
    if (!isPlaying) {
      togglePlayback();
    }

    toast({
      title: 'Preset Playing',
      description: `"${preset.name}" is now playing. Sliders are locked during playback.`,
    });
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="font-poppins font-medium text-xl mb-4">Preset Mixes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((_, index) => (
            <Card key={index} className="bg-[#1E1E1E] animate-pulse h-[120px]">
              <CardContent className="p-4"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !presets) {
    return (
      <div className="mb-8">
        <h2 className="font-poppins font-medium text-xl mb-4">Preset Mixes</h2>
        <Card className="bg-[#1E1E1E] p-4">
          <CardContent>
            <p className="text-[#BBBBBB]">Failed to load presets. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get top 3 sounds from a preset
  const getTopSounds = (settings: Record<string, number>) => {
    return Object.entries(settings)
      .filter(([_, value]) => value > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key);
  };

  return (
    <div className="mb-8">
      <h2 className="font-poppins font-medium text-xl mb-4">Preset Mixes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {presets.map((preset) => {
          const topSounds = getTopSounds(preset.settings as Record<string, number>);

          return (
            <Card 
              key={preset.id}
              className="card rounded-lg shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary/50 hover:shadow-2xl group"
              onClick={() => handlePresetClick(preset)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-poppins font-semibold text-lg tracking-tight">{preset.name}</h3>
                  <div className="p-2 rounded-full bg-[#2D2D2D] group-hover:bg-[#00BFA5]/10 transition-colors">
                    {presetIcons[preset.name] || <Moon className="h-5 w-5 text-[#00BFA5]" />}
                  </div>
                </div>
                <p className="text-[#BBBBBB] text-sm mb-4 line-clamp-2">{preset.description}</p>
                <div className="flex flex-wrap gap-2">
                  {topSounds.map((sound) => (
                    <Badge 
                      key={sound} 
                      variant="outline" 
                      className="bg-[#2D2D2D]/50 hover:bg-[#2D2D2D] border border-white/5 text-xs px-3 py-1 rounded-full transition-colors"
                    >
                      {sound}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}