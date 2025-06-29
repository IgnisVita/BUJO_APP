// ABOUTME: Pomodoro timer widget with beautiful circular progress and sound notifications
// Features custom intervals, session tracking, and Web Audio API notifications

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  Coffee,
  Trophy,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface TimerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

interface TimerSession {
  type: 'work' | 'short-break' | 'long-break';
  duration: number;
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
}

interface TimerSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  longBreakInterval: number; // sessions before long break
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

const defaultSettings: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartWork: false,
};

export function Timer({ 
  isOpen, 
  onClose, 
  position = { x: 200, y: 200 },
  onPositionChange 
}: TimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentSession, setCurrentSession] = React.useState<TimerSession['type']>('work');
  const [completedSessions, setCompletedSessions] = React.useState<TimerSession[]>([]);
  const [settings, setSettings] = React.useState<TimerSettings>(defaultSettings);
  const [showSettings, setShowSettings] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  const dragRef = React.useRef<HTMLDivElement>(null);
  const intervalRef = React.useRef<NodeJS.Timeout>();
  const audioContextRef = React.useRef<AudioContext>();

  // Initialize audio context
  React.useEffect(() => {
    if (typeof window !== 'undefined' && settings.soundEnabled) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported');
      }
    }
  }, [settings.soundEnabled]);

  // Timer logic
  React.useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Handle timer completion
  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play completion sound
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // Add completed session
    const session: TimerSession = {
      type: currentSession,
      duration: getCurrentDuration(),
      completed: true,
      startTime: new Date(Date.now() - getCurrentDuration() * 60 * 1000),
      endTime: new Date(),
    };
    setCompletedSessions(prev => [...prev, session]);

    // Determine next session
    if (currentSession === 'work') {
      const workSessions = completedSessions.filter(s => s.type === 'work').length + 1;
      const nextSessionType = workSessions % settings.longBreakInterval === 0 ? 'long-break' : 'short-break';
      
      if (settings.autoStartBreaks) {
        startSession(nextSessionType);
      } else {
        setCurrentSession(nextSessionType);
        setTimeLeft(getSessionDuration(nextSessionType) * 60);
      }
    } else {
      if (settings.autoStartWork) {
        startSession('work');
      } else {
        setCurrentSession('work');
        setTimeLeft(settings.workDuration * 60);
      }
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: `${currentSession === 'work' ? 'Work' : 'Break'} session completed!`,
        icon: '/icons/icon-192x192.png',
      });
    }
  };

  // Audio functions
  const playNotificationSound = () => {
    if (!audioContextRef.current) return;

    try {
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Create a pleasant completion sound
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.frequency.setValueAtTime(600, context.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, context.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  };

  // Timer controls
  const startTimer = () => {
    setIsRunning(true);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setTimeLeft(getCurrentDuration() * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getCurrentDuration() * 60);
  };

  const startSession = (type: TimerSession['type']) => {
    setCurrentSession(type);
    setTimeLeft(getSessionDuration(type) * 60);
    setIsRunning(true);
  };

  // Helper functions
  const getCurrentDuration = () => getSessionDuration(currentSession);

  const getSessionDuration = (type: TimerSession['type']) => {
    switch (type) {
      case 'work': return settings.workDuration;
      case 'short-break': return settings.shortBreakDuration;
      case 'long-break': return settings.longBreakDuration;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = getCurrentDuration() * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const getSessionIcon = (type: TimerSession['type']) => {
    switch (type) {
      case 'work': return <Clock className="h-4 w-4" />;
      case 'short-break': 
      case 'long-break': return <Coffee className="h-4 w-4" />;
    }
  };

  const getSessionColor = (type: TimerSession['type']) => {
    switch (type) {
      case 'work': return 'text-red-500';
      case 'short-break': return 'text-green-500';
      case 'long-break': return 'text-blue-500';
    }
  };

  const getSessionName = (type: TimerSession['type']) => {
    switch (type) {
      case 'work': return 'Focus Time';
      case 'short-break': return 'Short Break';
      case 'long-break': return 'Long Break';
    }
  };

  // Drag handling
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: event.clientX - dragOffset.x,
        y: event.clientY - dragOffset.y,
      };
      onPositionChange?.(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        isRunning ? pauseTimer() : startTimer();
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        resetTimer();
      } else if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        stopTimer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRunning]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dragRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-50 bg-background border border-border rounded-lg shadow-lg select-none"
          style={{
            left: position.x,
            top: position.y,
            width: 320,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-3 border-b cursor-move"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Pomodoro Timer</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                className="h-6 w-6"
                title="Toggle Sound"
              >
                {settings.soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="h-6 w-6"
                title="Settings"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <div className="p-6">
              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 p-4 border rounded-lg bg-muted/30"
                  >
                    <h3 className="font-medium mb-3">Timer Settings</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <label>Work Duration</label>
                        <input
                          type="number"
                          value={settings.workDuration}
                          onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) }))}
                          className="w-16 px-2 py-1 border rounded text-center"
                          min="1"
                          max="60"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label>Short Break</label>
                        <input
                          type="number"
                          value={settings.shortBreakDuration}
                          onChange={(e) => setSettings(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) }))}
                          className="w-16 px-2 py-1 border rounded text-center"
                          min="1"
                          max="30"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label>Long Break</label>
                        <input
                          type="number"
                          value={settings.longBreakDuration}
                          onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) }))}
                          className="w-16 px-2 py-1 border rounded text-center"
                          min="1"
                          max="60"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label>Auto-start breaks</label>
                        <input
                          type="checkbox"
                          checked={settings.autoStartBreaks}
                          onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label>Auto-start work</label>
                        <input
                          type="checkbox"
                          checked={settings.autoStartWork}
                          onChange={(e) => setSettings(prev => ({ ...prev, autoStartWork: e.target.checked }))}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Timer Display */}
              <div className="text-center mb-6">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-muted"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                      className={cn(
                        "transition-all duration-1000 ease-linear",
                        getSessionColor(currentSession)
                      )}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Time Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-mono font-bold">
                      {formatTime(timeLeft)}
                    </div>
                    <div className={cn("text-sm font-medium flex items-center gap-1", getSessionColor(currentSession))}>
                      {getSessionIcon(currentSession)}
                      {getSessionName(currentSession)}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={isRunning ? pauseTimer : startTimer}
                    className="h-12 w-12"
                  >
                    {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={stopTimer}
                    className="h-12 w-12"
                  >
                    <Square className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetTimer}
                    className="h-12 w-12"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>

                {/* Session Selector */}
                <div className="flex gap-1 justify-center">
                  <Button
                    variant={currentSession === 'work' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => startSession('work')}
                    className="text-xs"
                  >
                    Work
                  </Button>
                  <Button
                    variant={currentSession === 'short-break' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => startSession('short-break')}
                    className="text-xs"
                  >
                    Short Break
                  </Button>
                  <Button
                    variant={currentSession === 'long-break' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => startSession('long-break')}
                    className="text-xs"
                  >
                    Long Break
                  </Button>
                </div>
              </div>

              {/* Session Stats */}
              {completedSessions.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Today's Sessions</span>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{completedSessions.filter(s => s.type === 'work').length}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {completedSessions.slice(-8).map((session, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-3 h-3 rounded-full",
                          session.type === 'work' ? 'bg-red-500' : 
                          session.type === 'short-break' ? 'bg-green-500' : 'bg-blue-500'
                        )}
                        title={`${getSessionName(session.type)} - ${session.duration}min`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Keyboard Shortcuts Help */}
              <div className="mt-4 text-xs text-muted-foreground text-center">
                <div>Space: Play/Pause • R: Reset • S: Stop</div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}