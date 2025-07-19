
import { useState, useCallback } from 'react';
import { TrainerProfile, TrainerAssignment, AutoAssignmentConfig, TrainerSpecialty } from '@/types/trainer';
import { mockTrainers, mockAutoAssignmentConfig } from '@/mock/trainers';
import { TrainerAssignmentEngine, AssignmentRequest, AssignmentResult } from '@/utils/trainerAssignmentEngine';
import { useTrainerUtilization } from './useTrainerUtilization';

export const useTrainerAutoAssignment = (branchId: string) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [config] = useState<AutoAssignmentConfig>(mockAutoAssignmentConfig);
  
  // Use the new utilization system
  const { 
    updateMetrics, 
    config: utilizationConfig 
  } = useTrainerUtilization(branchId);

  // Initialize the assignment engine
  const [assignmentEngine] = useState(() => 
    new TrainerAssignmentEngine(config, utilizationConfig)
  );

  const autoAssignTrainer = useCallback(async (
    request: AssignmentRequest
  ): Promise<AssignmentResult> => {
    setIsAssigning(true);

    try {
      // Get available trainers for the branch
      const availableTrainers = mockTrainers.filter(trainer => 
        trainer.branchId === branchId && 
        trainer.isActive && 
        trainer.status === 'active'
      );

      // Mock existing assignments - in real app, this would come from API
      const existingAssignments: TrainerAssignment[] = [];

      // Update utilization metrics before assignment
      updateMetrics(availableTrainers, existingAssignments);

      // Use the enhanced assignment engine
      const result = await assignmentEngine.assignTrainer(
        request,
        availableTrainers,
        existingAssignments
      );

      return result;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assignment failed',
        confidence: 0
      };
    } finally {
      setIsAssigning(false);
    }
  }, [branchId, assignmentEngine, updateMetrics]);

  const getTrainerRecommendations = useCallback((
    request: Omit<AssignmentRequest, 'memberId'>
  ): TrainerProfile[] => {
    const availableTrainers = mockTrainers.filter(trainer => 
      trainer.branchId === branchId && 
      trainer.isActive && 
      trainer.status === 'active'
    );

    return assignmentEngine.getRecommendations(request, availableTrainers);
  }, [branchId, assignmentEngine]);

  return {
    autoAssignTrainer,
    getTrainerRecommendations,
    isAssigning,
    config
  };
};
