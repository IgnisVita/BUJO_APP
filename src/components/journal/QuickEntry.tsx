// ABOUTME: Quick entry component with auto-detection, voice input, and smart suggestions
// Features keyboard shortcuts, entry type detection, and voice-to-text functionality

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Mic, 
  MicOff, 
  Sparkles, 
  Calendar, 
  Circle, 
  Dot,
  Send,
  Loader2,
  Lightbulb
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import { EntryType } from '@/lib/types';
import { useJournalStore } from '@/lib/stores/journalStore';
import { cn } from '@/lib/utils/cn';
import { animations } from '@/lib/constants/design-tokens';
import { Button } from '@/components/ui/Button';

interface QuickEntryProps {
  pageId: number;
  onEntryCreated?: () => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

// Entry type detection patterns
const ENTRY_PATTERNS = {
  task: /^[•○\-\*]\s/,
  event: /^[📅🗓️]\s|^(meeting|appointment|call|event)\s/i,
  note: /^[📝💭]\s|^(note|idea|thought)\s/i,
  habit: /^[🔄📊]\s|^(habit|routine|daily)\s/i,
} as const;

// Smart suggestions based on common patterns
const SMART_SUGGESTIONS = [
  { text: '• Review project goals', type: 'task' as EntryType },
  { text: '📝 Meeting notes from team standup', type: 'note' as EntryType },
  { text: '📅 Doctor appointment at 2pm', type: 'event' as EntryType },
  { text: '🔄 30 minutes of exercise', type: 'habit' as EntryType },
];

// Keyboard shortcuts
const SHORTCUTS = [
  { key: 'Cmd+Enter', action: 'Submit entry' },
  { key: 'Cmd+M', action: 'Toggle microphone' },
  { key: 'Esc', action: 'Cancel' },
];

export function QuickEntry({ 
  pageId, 
  onEntryCreated, 
  className, 
  placeholder = "What's on your mind? Use • for tasks, 📝 for notes...",
  autoFocus = false 
}: QuickEntryProps) {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [detectedType, setDetectedType] = useState<EntryType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { createEntry } = useJournalStore();

  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  // Update content when transcript changes
  useEffect(() => {
    if (transcript) {
      setContent(transcript);
    }
  }, [transcript]);

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      setIsExpanded(true);
    }
  }, [autoFocus]);

  // Detect entry type from content
  const detectEntryType = useCallback((text: string): EntryType => {
    for (const [type, pattern] of Object.entries(ENTRY_PATTERNS)) {
      if (pattern.test(text)) {
        return type as EntryType;
      }
    }
    return 'note'; // Default to note
  }, []);

  // Extract tags from content
  const extractTags = useCallback((text: string): string[] => {
    const tagPattern = /#(\w+)/g;
    const matches = text.match(tagPattern);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  }, []);

  // Handle content change
  const handleContentChange = (value: string) => {
    setContent(value);
    setDetectedType(detectEntryType(value));
    setTags(extractTags(value));
  };

  // Handle microphone toggle
  const handleMicrophoneToggle = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ 
        continuous: true,
        language: 'en-US' // TODO: Make this configurable
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const entryType = detectedType || detectEntryType(content);
      
      await createEntry({
        pageId,
        type: entryType,
        content: content.trim(),
        tags,
        date: new Date(),
        order: Date.now(), // Simple ordering by timestamp
        ...(entryType === 'task' && { status: 'todo' })
      });

      // Reset form
      setContent('');
      setDetectedType(null);
      setTags([]);
      resetTranscript();
      setIsExpanded(false);
      
      onEntryCreated?.();
    } catch (error) {
      console.error('Failed to create entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsExpanded(false);
      setContent('');
      resetTranscript();
    } else if (e.key === 'm' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleMicrophoneToggle();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: typeof SMART_SUGGESTIONS[0]) => {
    setContent(suggestion.text);
    setDetectedType(suggestion.type);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const getTypeIcon = (type: EntryType | null) => {
    switch (type) {
      case 'task': return Circle;
      case 'note': return Dot;
      case 'event': return Calendar;
      case 'habit': return Circle;
      default: return Sparkles;
    }
  };

  const TypeIcon = getTypeIcon(detectedType);

  return (
    <motion.div
      layout
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700',
        'shadow-sm hover:shadow-md transition-all duration-200',
        isExpanded && 'shadow-lg ring-2 ring-primary-500/20',
        className
      )}
    >
      <motion.div layout className="p-4">
        {/* Main Input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={isExpanded ? 3 : 1}
            className={cn(
              'w-full resize-none bg-transparent border-none outline-none',
              'text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500',
              'text-sm leading-relaxed',
              isExpanded ? 'min-h-[80px]' : 'min-h-[40px]'
            )}
          />

          {/* Type indicator */}
          <AnimatePresence>
            {detectedType && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full"
              >
                <TypeIcon className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300 capitalize">
                  {detectedType}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags Display */}
        <AnimatePresence>
          {tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1 mt-2"
            >
              {tags.map((tag) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-full"
                >
                  #{tag}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-between mt-4"
            >
              <div className="flex items-center gap-2">
                {/* Voice Input Button */}
                {browserSupportsSpeechRecognition && isMicrophoneAvailable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMicrophoneToggle}
                    className={cn(
                      'transition-colors',
                      listening && 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    )}
                  >
                    {listening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                    <span className="sr-only">
                      {listening ? 'Stop recording' : 'Start voice input'}
                    </span>
                  </Button>
                )}

                {/* Suggestions Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="sr-only">Show suggestions</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent('');
                    resetTranscript();
                  }}
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  loading={isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Add Entry
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smart Suggestions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t border-neutral-200 dark:border-neutral-700 pt-4"
            >
              <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                Quick suggestions
              </h4>
              <div className="grid grid-cols-1 gap-1">
                {SMART_SUGGESTIONS.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    {suggestion.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Help */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs text-neutral-400 dark:text-neutral-500"
            >
              <span>⌘↵ to submit • ⌘M for voice • Esc to cancel</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export const MemoizedQuickEntry = motion.memo(QuickEntry);