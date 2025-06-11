import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Zap, Award, Medal, Crown, Gift } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'exploration' | 'performance' | 'creativity' | 'mastery' | 'social' | 'hidden';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  requirements: string[];
}

interface AchievementSystemProps {
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ onAchievementUnlocked }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const achievementDefinitions: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
    // Exploration Achievements
    {
      id: 'first_steps',
      title: 'First Steps',
      description: 'Open the 3D viewer for the first time',
      icon: Target,
      category: 'exploration',
      rarity: 'common',
      points: 10,
      maxProgress: 1,
      requirements: ['Open 3D viewer']
    },
    {
      id: 'part_collector',
      title: 'Part Collector',
      description: 'Add 10 parts to your library',
      icon: Trophy,
      category: 'exploration',
      rarity: 'common',
      points: 25,
      maxProgress: 10,
      requirements: ['Add 10 parts']
    },
    {
      id: 'library_master',
      title: 'Library Master',
      description: 'Add 100 parts to your library',
      icon: Crown,
      category: 'exploration',
      rarity: 'rare',
      points: 100,
      maxProgress: 100,
      requirements: ['Add 100 parts']
    },
    {
      id: 'category_explorer',
      title: 'Category Explorer',
      description: 'Add parts from 5 different categories',
      icon: Star,
      category: 'exploration',
      rarity: 'common',
      points: 30,
      maxProgress: 5,
      requirements: ['Add parts from 5 categories']
    },

    // Performance Achievements
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Maintain 60 FPS for 5 minutes',
      icon: Zap,
      category: 'performance',
      rarity: 'rare',
      points: 50,
      maxProgress: 300, // 5 minutes in seconds
      requirements: ['Maintain 60 FPS for 5 minutes']
    },
    {
      id: 'efficiency_expert',
      title: 'Efficiency Expert',
      description: 'Keep draw calls under 100 for 10 minutes',
      icon: Target,
      category: 'performance',
      rarity: 'epic',
      points: 75,
      maxProgress: 600,
      requirements: ['Keep draw calls under 100']
    },

    // Creativity Achievements
    {
      id: 'first_annotation',
      title: 'First Annotation',
      description: 'Add your first annotation',
      icon: Award,
      category: 'creativity',
      rarity: 'common',
      points: 15,
      maxProgress: 1,
      requirements: ['Add annotation']
    },
    {
      id: 'measurement_master',
      title: 'Measurement Master',
      description: 'Take 50 measurements',
      icon: Medal,
      category: 'creativity',
      rarity: 'rare',
      points: 60,
      maxProgress: 50,
      requirements: ['Take 50 measurements']
    },
    {
      id: 'workspace_designer',
      title: 'Workspace Designer',
      description: 'Create 3 custom workspaces',
      icon: Star,
      category: 'creativity',
      rarity: 'rare',
      points: 40,
      maxProgress: 3,
      requirements: ['Create 3 workspaces']
    },

    // Mastery Achievements
    {
      id: 'simulation_runner',
      title: 'Simulation Runner',
      description: 'Run 10 simulations',
      icon: Zap,
      category: 'mastery',
      rarity: 'common',
      points: 35,
      maxProgress: 10,
      requirements: ['Run 10 simulations']
    },
    {
      id: 'physics_master',
      title: 'Physics Master',
      description: 'Complete advanced physics simulation',
      icon: Crown,
      category: 'mastery',
      rarity: 'epic',
      points: 100,
      maxProgress: 1,
      requirements: ['Complete advanced physics simulation']
    },

    // Social Achievements
    {
      id: 'collaborator',
      title: 'Collaborator',
      description: 'Share a workspace with someone',
      icon: Gift,
      category: 'social',
      rarity: 'common',
      points: 20,
      maxProgress: 1,
      requirements: ['Share workspace']
    },

    // Hidden Achievements
    {
      id: 'konami_master',
      title: 'Konami Master',
      description: 'Activate the Konami code',
      icon: Crown,
      category: 'hidden',
      rarity: 'legendary',
      points: 200,
      maxProgress: 1,
      requirements: ['Enter Konami code']
    },
    {
      id: 'easter_egg_hunter',
      title: 'Easter Egg Hunter',
      description: 'Find 3 hidden easter eggs',
      icon: Gift,
      category: 'hidden',
      rarity: 'epic',
      points: 150,
      maxProgress: 3,
      requirements: ['Find 3 easter eggs']
    },
    {
      id: 'tetris_champion',
      title: 'Tetris Champion',
      description: 'Score 10,000 points in Part Tetris',
      icon: Trophy,
      category: 'hidden',
      rarity: 'rare',
      points: 80,
      maxProgress: 10000,
      requirements: ['Score 10,000 in Tetris']
    }
  ];

  useEffect(() => {
    // Initialize achievements from localStorage or defaults
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      const initialAchievements = achievementDefinitions.map(def => ({
        ...def,
        unlocked: false,
        progress: 0
      }));
      setAchievements(initialAchievements);
    }
  }, []);

  useEffect(() => {
    // Calculate total points
    const points = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);
    setTotalPoints(points);

    // Save to localStorage
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  const updateProgress = (achievementId: string, progress: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId && !achievement.unlocked) {
        const newProgress = Math.min(progress, achievement.maxProgress);
        const shouldUnlock = newProgress >= achievement.maxProgress;
        
        if (shouldUnlock && !achievement.unlocked) {
          const unlockedAchievement = {
            ...achievement,
            progress: newProgress,
            unlocked: true,
            unlockedAt: new Date()
          };
          
          // Show notification
          setRecentUnlocks(prev => [...prev, unlockedAchievement]);
          setTimeout(() => {
            setRecentUnlocks(prev => prev.filter(a => a.id !== achievementId));
          }, 5000);
          
          onAchievementUnlocked?.(unlockedAchievement);
          
          return unlockedAchievement;
        }
        
        return { ...achievement, progress: newProgress };
      }
      return achievement;
    }));
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'exploration': return Target;
      case 'performance': return Zap;
      case 'creativity': return Star;
      case 'mastery': return Crown;
      case 'social': return Gift;
      case 'hidden': return Trophy;
      default: return Award;
    }
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const categories = ['all', 'exploration', 'performance', 'creativity', 'mastery', 'social', 'hidden'];

  // Expose update function globally for other components to use
  useEffect(() => {
    (window as any).updateAchievementProgress = updateProgress;
    return () => {
      delete (window as any).updateAchievementProgress;
    };
  }, []);

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Achievements</h2>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">{totalPoints} points</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const Icon = category === 'all' ? Award : getCategoryIcon(category as Achievement['category']);
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="capitalize">{category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Achievements List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {filteredAchievements.map(achievement => {
          const Icon = achievement.icon;
          const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
          
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                achievement.unlocked
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  achievement.unlocked ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold ${
                      achievement.unlocked ? 'text-green-700 dark:text-green-300' : ''
                    }`}>
                      {achievement.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                      <span className="text-sm font-medium">{achievement.points}pts</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {achievement.description}
                  </p>
                  
                  {/* Progress Bar */}
                  {!achievement.unlocked && achievement.maxProgress > 1 && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  )}
                  
                  {/* Requirements */}
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Requirements:</div>
                    <div className="flex flex-wrap gap-1">
                      {achievement.requirements.map((req, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Unlocks Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {recentUnlocks.map(achievement => {
          const Icon = achievement.icon;
          return (
            <div
              key={achievement.id}
              className="bg-green-500 text-white p-4 rounded-lg shadow-lg animate-slide-in-right max-w-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Achievement Unlocked!</div>
                  <div className="text-sm">{achievement.title}</div>
                  <div className="text-xs opacity-90">+{achievement.points} points</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold">{achievements.filter(a => a.unlocked).length}</div>
            <div className="text-xs text-gray-500">Unlocked</div>
          </div>
          <div>
            <div className="text-lg font-bold">{achievements.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div>
            <div className="text-lg font-bold">
              {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;