
import { useState, useCallback } from 'react';
import { TrainerProfile, TrainerAssignment, AutoAssignmentConfig, TrainerSpecialty } from '@/types/trainer';
import { mockTrainers, mockAutoAssignmentConfig } from '@/mock/trainers';

interface AssignmentRequest {
  memberId: string;
  preferredSpecialty: TrainerSpecialty;
  scheduledDate: Date;
  duration: number;
  maxBudget?: number;
  preferredTrainerId?: string;
  memberPreferences?: {
    preferredGender?: 'male' | 'female';
    preferredExperience?: 'any' | 'beginner_friendly' | 'experienced' | 'expert';
    avoidTrainerIds?: string[];
  };
}

interface AssignmentResult {
  success: boolean;
  trainerId?: string;
  trainer?: TrainerProfile;
  assignment?: TrainerAssignment;
  alternatives?: TrainerProfile[];
  reason?: string;
  error?: string;
}

export const useTrainerAutoAssignment = (branchId: string) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [config] = useState<AutoAssignmentConfig>(mockAutoAssignmentConfig);

  const checkTrainerAvailability = useCallback((
    trainer: TrainerProfile,
    requestedDate: Date,
    duration: number
  ): boolean => {
    const dayOfWeek = requestedDate.getDay();
    const requestedTime = requestedDate.getHours() * 60 + requestedDate.getMinutes();
    
    const availability = trainer.availability.find(av => av.dayOfWeek === dayOfWeek);
    if (!availability || !availability.isAvailable) return false;

    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    return requestedTime >= startTime && (requestedTime + duration) <= endTime;
  }, []);

  const calculateTrainerScore = useCallback((
    trainer: TrainerProfile,
    request: AssignmentRequest
  ): number => {
    let score = 0;
    const weights = {
      specialty_match: 40,
      rating: 25,
      experience: 20,
      price: 10,
      availability: 5
    };

    // Specialty match
    if (trainer.specialties.includes(request.preferredSpecialty)) {
      score += weights.specialty_match;
    }

    // Rating score (normalize 0-5 to 0-25)
    score += (trainer.rating / 5) * weights.rating;

    // Experience score (cap at 10 years, normalize to 0-20)
    const expScore = Math.min(trainer.experience, 10) / 10;
    score += expScore * weights.experience;

    // Price score (lower price = higher score, normalize based on budget)
    if (request.maxBudget) {
      const priceScore = Math.max(0, 1 - (trainer.hourlyRate / request.maxBudget));
      score += priceScore * weights.price;
    } else {
      score += weights.price * 0.5; // neutral score if no budget specified
    }

    // Availability bonus
    if (checkTrainerAvailability(trainer, request.scheduledDate, request.duration)) {
      score += weights.availability;
    }

    return score;
  }, [checkTrainerAvailability]);

  const findBestTrainer = useCallback((
    availableTrainers: TrainerProfile[],
    request: AssignmentRequest
  ): { best?: TrainerProfile; alternatives: TrainerProfile[] } => {
    // Score and sort trainers
    const scoredTrainers = availableTrainers
      .map(trainer => ({
        trainer,
        score: calculateTrainerScore(trainer, request)
      }))
      .sort((a, b) => b.score - a.score);

    const best = scoredTrainers[0]?.trainer;
    const alternatives = scoredTrainers.slice(1, 4).map(st => st.trainer);

    return { best, alternatives };
  }, [calculateTrainerScore]);

  const autoAssignTrainer = useCallback(async (
    request: AssignmentRequest
  ): Promise<AssignmentResult> => {
    setIsAssigning(true);

    try {
      // Get available trainers for the branch
      let availableTrainers = mockTrainers.filter(trainer => 
        trainer.branchId === branchId && 
        trainer.isActive && 
        trainer.status === 'active'
      );

      // Apply configuration filters
      if (config.requireSpecialtyMatch) {
        availableTrainers = availableTrainers.filter(trainer =>
          trainer.specialties.includes(request.preferredSpecialty)
        );
      }

      if (config.requireAvailability) {
        availableTrainers = availableTrainers.filter(trainer =>
          checkTrainerAvailability(trainer, request.scheduledDate, request.duration)
        );
      }

      if (config.minRatingThreshold) {
        availableTrainers = availableTrainers.filter(trainer =>
          trainer.rating >= config.minRatingThreshold!
        );
      }

      if (config.minExperienceThreshold) {
        availableTrainers = availableTrainers.filter(trainer =>
          trainer.experience >= config.minExperienceThreshold!
        );
      }

      if (config.maxPriceThreshold && request.maxBudget) {
        const budget = Math.min(config.maxPriceThreshold, request.maxBudget);
        availableTrainers = availableTrainers.filter(trainer =>
          trainer.hourlyRate <= budget
        );
      }

      // Apply member preferences
      if (request.memberPreferences?.avoidTrainerIds) {
        availableTrainers = availableTrainers.filter(trainer =>
          !request.memberPreferences!.avoidTrainerIds!.includes(trainer.id)
        );
      }

      if (availableTrainers.length === 0) {
        return {
          success: false,
          error: 'No trainers available matching the criteria',
          reason: 'No suitable trainers found'
        };
      }

      // Find the best trainer
      const { best, alternatives } = findBestTrainer(availableTrainers, request);

      if (!best) {
        return {
          success: false,
          error: 'Could not determine best trainer',
          alternatives: availableTrainers.slice(0, 3)
        };
      }

      // Create assignment
      const assignment: TrainerAssignment = {
        id: `assignment_${Date.now()}`,
        trainerId: best.id,
        memberId: request.memberId,
        sessionType: 'single',
        
        scheduledDate: request.scheduledDate,
        duration: request.duration,
        sessionType_detail: request.preferredSpecialty,
        
        status: 'scheduled',
        
        isPaid: false,
        amount: best.hourlyRate,
        
        assignedBy: 'auto',
        assignmentReason: `Auto-assigned based on specialty match and availability`,
        alternativeTrainers: alternatives.map(t => t.id),
        
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        success: true,
        trainerId: best.id,
        trainer: best,
        assignment,
        alternatives,
        reason: 'Successfully auto-assigned based on matching criteria'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assignment failed'
      };
    } finally {
      setIsAssigning(false);
    }
  }, [branchId, config, checkTrainerAvailability, findBestTrainer]);

  const getTrainerRecommendations = useCallback((
    request: Omit<AssignmentRequest, 'memberId'>
  ): TrainerProfile[] => {
    const availableTrainers = mockTrainers.filter(trainer => 
      trainer.branchId === branchId && 
      trainer.isActive && 
      trainer.status === 'active'
    );

    const { alternatives } = findBestTrainer(availableTrainers, {
      ...request,
      memberId: 'temp'
    });

    return alternatives;
  }, [branchId, findBestTrainer]);

  return {
    autoAssignTrainer,
    getTrainerRecommendations,
    isAssigning,
    config
  };
};
