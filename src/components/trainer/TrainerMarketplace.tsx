import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { TrainerCard } from './TrainerCard';
import { TrainerProfile } from './TrainerProfile';
import { mockTrainers } from '@/mock/trainers';
import { TrainerProfile as TrainerProfileType, TrainerSpecialty } from '@/types/trainer';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { useBranchContext } from '@/hooks/useBranchContext';

interface TrainerMarketplaceProps {
  onTrainerSelect?: (trainer: TrainerProfileType) => void;
  showPackageSelection?: boolean;
}

export const TrainerMarketplace = ({ onTrainerSelect, showPackageSelection = false }: TrainerMarketplaceProps) => {
  const { currentBranch } = useBranchContext();
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfileType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<TrainerSpecialty | 'all'>('all');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [experienceRange, setExperienceRange] = useState([0, 20]);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const specialties: TrainerSpecialty[] = [
    'strength_training', 'cardio', 'yoga', 'pilates', 'crossfit',
    'martial_arts', 'dance', 'swimming', 'rehabilitation', 'nutrition',
    'weight_loss', 'bodybuilding', 'sports_performance', 'senior_fitness', 'youth_fitness'
  ];

  const filteredTrainers = useMemo(() => {
    let filtered = mockTrainers.filter(trainer => {
      if (currentBranch && trainer.branchId !== currentBranch.id) return false;
      if (!trainer.isActive || trainer.status !== 'active') return false;
      
      // Search query filter
      if (searchQuery && !trainer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !trainer.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Specialty filter
      if (selectedSpecialty !== 'all' && !trainer.specialties.includes(selectedSpecialty)) {
        return false;
      }
      
      // Price range filter
      if (trainer.hourlyRate < priceRange[0] || trainer.hourlyRate > priceRange[1]) {
        return false;
      }
      
      // Experience range filter
      if (trainer.experience < experienceRange[0] || trainer.experience > experienceRange[1]) {
        return false;
      }
      
      return true;
    });

    // Sort trainers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.hourlyRate - b.hourlyRate;
        case 'experience':
          return b.experience - a.experience;
        default:
          return 0;
      }
    });

    return filtered;
  }, [currentBranch, searchQuery, selectedSpecialty, priceRange, experienceRange, sortBy]);

  const handleTrainerClick = (trainer: TrainerProfileType) => {
    if (showPackageSelection) {
      setSelectedTrainer(trainer);
    } else {
      onTrainerSelect?.(trainer);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('all');
    setPriceRange([0, 200]);
    setExperienceRange([0, 20]);
    setSortBy('rating');
  };

  if (selectedTrainer && showPackageSelection) {
    return (
      <TrainerProfile 
        trainer={selectedTrainer} 
        onBack={() => setSelectedTrainer(null)}
        showPackageSelection={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Find Your Perfect Trainer</h1>
          <p className="text-muted-foreground mt-2">
            Browse our certified trainers and book your sessions
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredTrainers.length} trainers available
        </Badge>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search trainers or specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 items-center">
              <Select value={selectedSpecialty} onValueChange={(value) => setSelectedSpecialty(value as TrainerSpecialty | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'rating' | 'price' | 'experience')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}/hour
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={200}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Experience Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Experience: {experienceRange[0]} - {experienceRange[1]} years
                  </label>
                  <Slider
                    value={experienceRange}
                    onValueChange={setExperienceRange}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button variant="outline" onClick={() => setShowFilters(false)}>
                  Hide Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainers Grid */}
      {filteredTrainers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              trainer={trainer}
              onClick={() => handleTrainerClick(trainer)}
              showBookButton={true}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trainers found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Try adjusting your search criteria or filters to find available trainers.
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};