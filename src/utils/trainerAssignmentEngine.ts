import { TrainerProfile, TrainerAssignment, TrainerSpecialty, AutoAssignmentConfig } from '@/types/trainer';
import { TrainerUtilizationTracker, UtilizationConfig } from './trainerUtilization';

export interface AssignmentRequest {
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
    preferredLanguages?: string[];
  };
  sessionType?: 'single' | 'package' | 'membership';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface AssignmentResult {
  success: boolean;
  trainerId?: string;
  trainer?: TrainerProfile;
  assignment?: TrainerAssignment;
  alternatives?: TrainerProfile[];
  reason?: string;
  error?: string;
  confidence: number; // 0-100 score
  utilizationImpact?: {
    beforeUtilization: number;
    afterUtilization: number;
  };
}

export interface SkillMatchResult {
  trainer: TrainerProfile;
  specialtyScore: number;
  experienceScore: number;
  ratingScore: number;
  availabilityScore: number;
  priceScore: number;
  utilizationScore: number;
  totalScore: number;
}

export class TrainerAssignmentEngine {
  private config: AutoAssignmentConfig;
  private utilizationConfig: UtilizationConfig;
  private utilizationTracker: TrainerUtilizationTracker;

  constructor(config: AutoAssignmentConfig, utilizationConfig: UtilizationConfig) {
    this.config = config;
    this.utilizationConfig = utilizationConfig;
    this.utilizationTracker = new TrainerUtilizationTracker(utilizationConfig);
  }

  async assignTrainer(
    request: AssignmentRequest,
    availableTrainers: TrainerProfile[],
    existingAssignments: TrainerAssignment[]
  ): Promise<AssignmentResult> {
    try {
      // Step 1: Filter trainers by basic criteria
      let candidateTrainers = this.applyBasicFilters(availableTrainers, request);
      
      if (candidateTrainers.length === 0) {
        return {
          success: false,
          error: 'No trainers available matching basic criteria',
          confidence: 0
        };
      }

      // Step 2: Update utilization metrics for all candidates
      await this.updateUtilizationMetrics(candidateTrainers, existingAssignments);

      // Step 3: Apply utilization-based filtering
      candidateTrainers = candidateTrainers.filter(trainer =>
        this.utilizationTracker.isTrainerAvailableForAssignment(trainer.id)
      );

      if (candidateTrainers.length === 0) {
        return {
          success: false,
          error: 'No trainers available due to capacity constraints',
          confidence: 0
        };
      }

      // Step 4: Skill-based matching and scoring
      const skillMatches = this.performSkillMatching(candidateTrainers, request);

      // Step 5: Load balancing consideration
      const loadBalancedResults = this.applyLoadBalancing(skillMatches);

      // Step 6: Select best trainer
      const bestMatch = loadBalancedResults[0];
      const alternatives = loadBalancedResults.slice(1, 4).map(sm => sm.trainer);

      if (!bestMatch) {
        return {
          success: false,
          error: 'Could not determine best trainer match',
          confidence: 0,
          alternatives
        };
      }

      // Step 7: Create assignment
      const assignment = this.createAssignment(bestMatch.trainer, request);
      
      // Step 8: Calculate utilization impact
      const currentUtilization = this.utilizationTracker.getUtilizationScore(bestMatch.trainer.id);
      const utilizationImpact = {
        beforeUtilization: currentUtilization,
        afterUtilization: Math.min(currentUtilization + 10, 100) // Estimated impact
      };

      return {
        success: true,
        trainerId: bestMatch.trainer.id,
        trainer: bestMatch.trainer,
        assignment,
        alternatives,
        reason: this.generateAssignmentReason(bestMatch),
        confidence: bestMatch.totalScore,
        utilizationImpact
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assignment failed',
        confidence: 0
      };
    }
  }

  private applyBasicFilters(trainers: TrainerProfile[], request: AssignmentRequest): TrainerProfile[] {
    return trainers.filter(trainer => {
      // Active status check
      if (!trainer.isActive || trainer.status !== 'active') return false;

      // Specialty match (if required by config)
      if (this.config.requireSpecialtyMatch && 
          !trainer.specialties.includes(request.preferredSpecialty)) {
        return false;
      }

      // Availability check (if required by config)
      if (this.config.requireAvailability && 
          !this.checkTrainerAvailability(trainer, request.scheduledDate, request.duration)) {
        return false;
      }

      // Rating threshold
      if (this.config.minRatingThreshold && 
          trainer.rating < this.config.minRatingThreshold) {
        return false;
      }

      // Experience threshold
      if (this.config.minExperienceThreshold && 
          trainer.experience < this.config.minExperienceThreshold) {
        return false;
      }

      // Price threshold
      if (this.config.maxPriceThreshold && request.maxBudget) {
        const budget = Math.min(this.config.maxPriceThreshold, request.maxBudget);
        if (trainer.hourlyRate > budget) return false;
      }

      // Member preferences
      if (request.memberPreferences?.avoidTrainerIds?.includes(trainer.id)) {
        return false;
      }

      // Note: gender filtering removed as it's not in TrainerProfile type
      // This would need to be added to TrainerProfile if needed

      return true;
    });
  }

  private async updateUtilizationMetrics(
    trainers: TrainerProfile[], 
    assignments: TrainerAssignment[]
  ): Promise<void> {
    const dateRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)     // 7 days ahead
    };

    trainers.forEach(trainer => {
      this.utilizationTracker.calculateUtilization(trainer, assignments, dateRange);
    });
  }

  private performSkillMatching(trainers: TrainerProfile[], request: AssignmentRequest): SkillMatchResult[] {
    return trainers.map(trainer => {
      const specialtyScore = this.calculateSpecialtyScore(trainer, request);
      const experienceScore = this.calculateExperienceScore(trainer, request);
      const ratingScore = this.calculateRatingScore(trainer);
      const availabilityScore = this.calculateAvailabilityScore(trainer, request);
      const priceScore = this.calculatePriceScore(trainer, request);
      const utilizationScore = this.utilizationTracker.getUtilizationScore(trainer.id);

      const weights = {
        specialty: 30,
        experience: 20,
        rating: 20,
        availability: 10,
        price: 10,
        utilization: 10
      };

      const totalScore = (
        (specialtyScore * weights.specialty) +
        (experienceScore * weights.experience) +
        (ratingScore * weights.rating) +
        (availabilityScore * weights.availability) +
        (priceScore * weights.price) +
        (utilizationScore * weights.utilization)
      ) / 100;

      return {
        trainer,
        specialtyScore,
        experienceScore,
        ratingScore,
        availabilityScore,
        priceScore,
        utilizationScore,
        totalScore
      };
    });
  }

  private calculateSpecialtyScore(trainer: TrainerProfile, request: AssignmentRequest): number {
    if (trainer.specialties.includes(request.preferredSpecialty)) {
      // Check if it's primary specialty (first in list)
      return trainer.specialties[0] === request.preferredSpecialty ? 100 : 80;
    }
    
    // Partial points for related specialties
    const relatedSpecialties = this.getRelatedSpecialties(request.preferredSpecialty);
    const hasRelated = trainer.specialties.some(s => relatedSpecialties.includes(s));
    return hasRelated ? 40 : 0;
  }

  private calculateExperienceScore(trainer: TrainerProfile, request: AssignmentRequest): number {
    const experienceYears = trainer.experience;
    
    // Match experience preference if specified
    if (request.memberPreferences?.preferredExperience) {
      const pref = request.memberPreferences.preferredExperience;
      if (pref === 'beginner_friendly' && experienceYears >= 2) return 100;
      if (pref === 'experienced' && experienceYears >= 5) return 100;
      if (pref === 'expert' && experienceYears >= 10) return 100;
      if (pref === 'any') return 70;
      return 30; // Mismatch penalty
    }

    // Default scoring based on experience level
    return Math.min((experienceYears / 10) * 100, 100);
  }

  private calculateRatingScore(trainer: TrainerProfile): number {
    return (trainer.rating / 5) * 100;
  }

  private calculateAvailabilityScore(trainer: TrainerProfile, request: AssignmentRequest): number {
    return this.checkTrainerAvailability(trainer, request.scheduledDate, request.duration) ? 100 : 0;
  }

  private calculatePriceScore(trainer: TrainerProfile, request: AssignmentRequest): number {
    if (!request.maxBudget) return 50; // Neutral score if no budget
    
    const ratio = trainer.hourlyRate / request.maxBudget;
    if (ratio <= 0.7) return 100; // Great value
    if (ratio <= 0.85) return 80;  // Good value
    if (ratio <= 1.0) return 60;   // At budget
    return 20; // Over budget but still considered
  }

  private checkTrainerAvailability(
    trainer: TrainerProfile,
    requestedDate: Date,
    duration: number
  ): boolean {
    const dayOfWeek = requestedDate.getDay();
    const requestedTime = requestedDate.getHours() * 60 + requestedDate.getMinutes();
    
    const availability = trainer.availability.find(av => av.dayOfWeek === dayOfWeek);
    if (!availability || !availability.isAvailable) return false;

    const [startHour, startMin] = availability.startTime.split(':').map(Number);
    const [endHour, endMin] = availability.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    return requestedTime >= startTime && (requestedTime + duration) <= endTime;
  }

  private applyLoadBalancing(skillMatches: SkillMatchResult[]): SkillMatchResult[] {
    return skillMatches
      .sort((a, b) => {
        // Primary sort by total score
        const scoreDiff = b.totalScore - a.totalScore;
        if (Math.abs(scoreDiff) > 5) return scoreDiff; // Significant score difference
        
        // Secondary sort by utilization (favor less utilized trainers)
        return b.utilizationScore - a.utilizationScore;
      });
  }

  private createAssignment(trainer: TrainerProfile, request: AssignmentRequest): TrainerAssignment {
    return {
      id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trainerId: trainer.id,
      memberId: request.memberId,
      sessionType: (request.sessionType === 'membership' ? 'package' : request.sessionType) || 'single',
      scheduledDate: request.scheduledDate,
      duration: request.duration,
      sessionType_detail: request.preferredSpecialty,
      status: 'scheduled',
      isPaid: false,
      amount: trainer.hourlyRate,
      assignedBy: 'auto',
      assignmentReason: 'Auto-assigned by enhanced matching engine',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateAssignmentReason(match: SkillMatchResult): string {
    const reasons = [];
    
    if (match.specialtyScore >= 80) {
      reasons.push('specialty expertise');
    }
    if (match.ratingScore >= 90) {
      reasons.push('excellent rating');
    }
    if (match.utilizationScore >= 70) {
      reasons.push('optimal availability');
    }
    if (match.experienceScore >= 80) {
      reasons.push('relevant experience');
    }

    return `Auto-assigned based on: ${reasons.join(', ') || 'best overall match'}`;
  }

  private getRelatedSpecialties(specialty: TrainerSpecialty): TrainerSpecialty[] {
    const relations: Record<TrainerSpecialty, TrainerSpecialty[]> = {
      strength_training: ['crossfit', 'bodybuilding', 'sports_performance'],
      cardio: ['dance', 'swimming', 'weight_loss'],
      yoga: ['pilates', 'rehabilitation'],
      pilates: ['yoga', 'rehabilitation'],
      crossfit: ['strength_training', 'cardio', 'sports_performance'],
      martial_arts: ['sports_performance'],
      swimming: ['cardio', 'rehabilitation'],
      dance: ['cardio'],
      rehabilitation: ['yoga', 'pilates', 'swimming', 'senior_fitness'],
      nutrition: ['weight_loss', 'bodybuilding'],
      weight_loss: ['cardio', 'nutrition'],
      bodybuilding: ['strength_training', 'nutrition'],
      sports_performance: ['strength_training', 'crossfit'],
      senior_fitness: ['rehabilitation', 'yoga'],
      youth_fitness: ['sports_performance']
    };

    return relations[specialty] || [];
  }

  getRecommendations(
    request: Omit<AssignmentRequest, 'memberId'>,
    availableTrainers: TrainerProfile[]
  ): TrainerProfile[] {
    const skillMatches = this.performSkillMatching(availableTrainers, {
      ...request,
      memberId: 'temp'
    });

    return this.applyLoadBalancing(skillMatches)
      .slice(0, 5)
      .map(match => match.trainer);
  }
}