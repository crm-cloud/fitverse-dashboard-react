
import { DietPlan, WorkoutPlan, Exercise, Meal, MemberPlanAssignment, PlanProgress, AIInsight } from '@/types/diet-workout';

export const mockMeals: Meal[] = [
  {
    id: 'meal-1',
    name: 'Protein Power Breakfast',
    description: 'High-protein breakfast to kickstart your day',
    ingredients: ['3 eggs', '1 cup spinach', '1/2 avocado', '1 slice whole grain toast'],
    nutrition: {
      calories: 420,
      protein: 25,
      carbs: 18,
      fat: 28,
      fiber: 8,
      sugar: 3
    },
    preparationTime: 15,
    difficulty: 'easy',
    mealType: 'breakfast',
    instructions: [
      'Heat pan over medium heat',
      'Scramble eggs with spinach',
      'Toast bread and top with avocado',
      'Serve together'
    ]
  },
  {
    id: 'meal-2',
    name: 'Grilled Chicken Salad',
    description: 'Fresh and healthy lunch option',
    ingredients: ['150g grilled chicken breast', '2 cups mixed greens', '1/2 cucumber', '1 tomato', '2 tbsp olive oil dressing'],
    nutrition: {
      calories: 350,
      protein: 35,
      carbs: 12,
      fat: 18,
      fiber: 4,
      sugar: 8
    },
    preparationTime: 20,
    difficulty: 'easy',
    mealType: 'lunch',
    instructions: [
      'Grill chicken breast until cooked through',
      'Chop vegetables',
      'Mix greens with vegetables',
      'Top with sliced chicken and dressing'
    ]
  }
];

export const mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Push-ups',
    description: 'Classic bodyweight exercise for chest, shoulders, and triceps',
    muscleGroups: ['chest', 'shoulders', 'triceps', 'core'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: [
      'Start in plank position',
      'Lower body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep core engaged throughout'
    ],
    tips: [
      'Keep your body in a straight line',
      'Don\'t let hips sag or pike up',
      'Breathe out as you push up'
    ]
  },
  {
    id: 'ex-2',
    name: 'Squats',
    description: 'Fundamental lower body exercise',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower body by bending knees and hips',
      'Go down until thighs are parallel to floor',
      'Push through heels to return to start'
    ],
    tips: [
      'Keep chest up and core engaged',
      'Don\'t let knees cave inward',
      'Weight should be on heels'
    ]
  }
];

export const mockDietPlans: DietPlan[] = [
  {
    id: 'diet-1',
    name: 'Balanced Nutrition Plan',
    description: 'A well-rounded diet plan for general fitness and health',
    createdBy: 'trainer@gymfit.com',
    createdByName: 'Mike Rodriguez',
    targetCalories: 2000,
    duration: 30,
    meals: {
      '1': [mockMeals[0], mockMeals[1]],
      '2': [mockMeals[0], mockMeals[1]]
    },
    tags: ['balanced', 'healthy', 'sustainable'],
    difficulty: 'beginner',
    dietType: 'balanced',
    isPublic: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const mockWorkoutPlans: WorkoutPlan[] = [
  {
    id: 'workout-1',
    name: 'Beginner Full Body',
    description: 'Perfect starter workout for new gym members',
    createdBy: 'trainer@gymfit.com',
    createdByName: 'Mike Rodriguez',
    duration: 4,
    workouts: {
      '1': [
        { exerciseId: 'ex-1', sets: 3, reps: 10, restTime: 60 },
        { exerciseId: 'ex-2', sets: 3, reps: 15, restTime: 60 }
      ]
    },
    tags: ['beginner', 'full-body', 'strength'],
    difficulty: 'beginner',
    workoutType: 'strength',
    targetMuscleGroups: ['chest', 'legs', 'core'],
    estimatedDuration: 45,
    isPublic: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const mockPlanAssignments: MemberPlanAssignment[] = [
  {
    id: 'assign-1',
    memberId: '3',
    memberName: 'Emily Chen',
    dietPlanId: 'diet-1',
    workoutPlanId: 'workout-1',
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-02-20'),
    progress: 65,
    status: 'active',
    assignedBy: 'trainer@gymfit.com',
    assignedByName: 'Mike Rodriguez',
    notes: 'Member is very motivated and following plan well'
  }
];

export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight-1',
    memberId: '3',
    type: 'nutrition',
    title: 'Protein Intake Below Target',
    description: 'Your protein intake has been 15% below target for the past week. Consider adding a protein shake post-workout.',
    priority: 'medium',
    actionItems: [
      'Add whey protein shake after workouts',
      'Include Greek yogurt as afternoon snack',
      'Consider lean protein sources for dinner'
    ],
    generatedAt: new Date(),
    isRead: false
  },
  {
    id: 'insight-2',
    memberId: '3',
    type: 'progress',
    title: 'Great Progress This Week!',
    description: 'You\'ve completed 90% of your planned workouts and maintained consistent nutrition. Keep it up!',
    priority: 'low',
    generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true
  }
];
