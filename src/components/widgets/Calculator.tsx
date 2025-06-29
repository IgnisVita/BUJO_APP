// ABOUTME: Floating calculator widget with scientific mode and history
// Features keyboard support, memory functions, and beautiful animations

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  History,
  RotateCcw,
  Copy,
  Calculator as CalculatorIcon,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

interface CalculatorHistory {
  expression: string;
  result: string;
  timestamp: Date;
}

const basicOperators = ['+', '-', '*', '/', '='];
const scientificFunctions = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'pow', 'pi', 'e'];

export function Calculator({ 
  isOpen, 
  onClose, 
  position = { x: 100, y: 100 },
  onPositionChange 
}: CalculatorProps) {
  const [display, setDisplay] = React.useState('0');
  const [expression, setExpression] = React.useState('');
  const [previousResult, setPreviousResult] = React.useState<number | null>(null);
  const [memory, setMemory] = React.useState(0);
  const [history, setHistory] = React.useState<CalculatorHistory[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);
  const [isScientific, setIsScientific] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  const dragRef = React.useRef<HTMLDivElement>(null);

  // Handle number input
  const handleNumber = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  // Handle operator input
  const handleOperator = (op: string) => {
    if (op === '=') {
      calculate();
    } else {
      setExpression(display + ' ' + op + ' ');
      setDisplay('0');
    }
  };

  // Calculate result
  const calculate = () => {
    try {
      const fullExpression = expression + display;
      
      // Safe evaluation with limited operations
      const result = evaluateExpression(fullExpression);
      
      const historyItem: CalculatorHistory = {
        expression: fullExpression,
        result: result.toString(),
        timestamp: new Date(),
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
      setDisplay(result.toString());
      setPreviousResult(result);
      setExpression('');
    } catch (error) {
      setDisplay('Error');
      setExpression('');
    }
  };

  // Safe expression evaluator (simplified)
  const evaluateExpression = (expr: string): number => {
    // Remove spaces and validate
    const cleanExpr = expr.replace(/\s/g, '');
    
    // Basic safety check - only allow numbers, operators, and parentheses
    if (!/^[0-9+\-*/.()pi√e]+$/.test(cleanExpr)) {
      throw new Error('Invalid expression');
    }

    // Replace constants
    let processedExpr = cleanExpr
      .replace(/pi/g, Math.PI.toString())
      .replace(/e/g, Math.E.toString())
      .replace(/√(\d+)/g, 'sqrt($1)');

    // For simplicity, we'll use a basic parser
    // In production, use a proper math expression parser
    try {
      return Function('"use strict"; return (' + processedExpr + ')')();
    } catch {
      throw new Error('Calculation error');
    }
  };

  // Handle scientific functions
  const handleScientific = (func: string) => {
    const currentValue = parseFloat(display);
    let result: number;

    switch (func) {
      case 'sin':
        result = Math.sin(currentValue);
        break;
      case 'cos':
        result = Math.cos(currentValue);
        break;
      case 'tan':
        result = Math.tan(currentValue);
        break;
      case 'log':
        result = Math.log10(currentValue);
        break;
      case 'ln':
        result = Math.log(currentValue);
        break;
      case 'sqrt':
        result = Math.sqrt(currentValue);
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      default:
        return;
    }

    setDisplay(result.toString());
  };

  // Clear functions
  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // Memory functions
  const memoryStore = () => {
    setMemory(parseFloat(display));
  };

  const memoryRecall = () => {
    setDisplay(memory.toString());
  };

  const memoryAdd = () => {
    setMemory(memory + parseFloat(display));
  };

  const memoryClear = () => {
    setMemory(0);
  };

  // Copy to clipboard
  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(display);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Keyboard support
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      
      if (event.key >= '0' && event.key <= '9') {
        handleNumber(event.key);
      } else if (['+', '-', '*', '/'].includes(event.key)) {
        handleOperator(event.key);
      } else if (event.key === 'Enter' || event.key === '=') {
        calculate();
      } else if (event.key === 'Escape') {
        clear();
      } else if (event.key === 'Backspace') {
        setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      } else if (event.key === '.') {
        if (!display.includes('.')) {
          setDisplay(display + '.');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display]);

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
            width: isScientific ? 400 : 280,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-3 border-b cursor-move"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              <CalculatorIcon className="h-4 w-4" />
              <span className="font-medium">Calculator</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsScientific(!isScientific)}
                className="h-6 w-6"
                title="Toggle Scientific Mode"
              >
                <span className="text-xs">f(x)</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistory(!showHistory)}
                className="h-6 w-6"
                title="Show History"
              >
                <History className="h-3 w-3" />
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
            <div className="p-4">
              {/* Display */}
              <div className="mb-4">
                <div className="bg-muted p-3 rounded text-right">
                  {expression && (
                    <div className="text-sm text-muted-foreground mb-1">
                      {expression}
                    </div>
                  )}
                  <div className="text-2xl font-mono">{display}</div>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyResult}
                    className="flex-1"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clear}
                    className="flex-1"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>

              {/* History Panel */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-4 border rounded"
                  >
                    <div className="p-2 border-b bg-muted/50 flex justify-between items-center">
                      <span className="text-sm font-medium">History</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="h-6 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {history.length === 0 ? (
                        <div className="p-3 text-center text-sm text-muted-foreground">
                          No calculations yet
                        </div>
                      ) : (
                        history.map((item, index) => (
                          <button
                            key={index}
                            className="w-full p-2 text-left hover:bg-accent text-sm border-b last:border-b-0"
                            onClick={() => setDisplay(item.result)}
                          >
                            <div className="font-mono">{item.expression} = {item.result}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Button Grid */}
              <div className={cn(
                "grid gap-2",
                isScientific ? "grid-cols-6" : "grid-cols-4"
              )}>
                {/* Scientific Functions */}
                {isScientific && (
                  <>
                    {scientificFunctions.slice(0, 6).map((func) => (
                      <Button
                        key={func}
                        variant="outline"
                        size="sm"
                        onClick={() => handleScientific(func)}
                        className="text-xs"
                      >
                        {func}
                      </Button>
                    ))}
                  </>
                )}

                {/* Memory Functions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={memoryClear}
                  className="text-xs"
                  title="Memory Clear"
                >
                  MC
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={memoryRecall}
                  className="text-xs"
                  title="Memory Recall"
                >
                  MR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={memoryAdd}
                  className="text-xs"
                  title="Memory Add"
                >
                  M+
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={memoryStore}
                  className="text-xs"
                  title="Memory Store"
                >
                  MS
                </Button>

                {/* Clear Functions */}
                <Button variant="outline" size="sm" onClick={clear}>C</Button>
                <Button variant="outline" size="sm" onClick={clearEntry}>CE</Button>
                <Button variant="outline" size="sm" onClick={() => setDisplay(prev => prev.slice(0, -1))}>⌫</Button>
                <Button variant="outline" size="sm" onClick={() => handleOperator('/')}>÷</Button>

                {/* Number Pad */}
                {[7, 8, 9].map(num => (
                  <Button key={num} variant="outline" size="sm" onClick={() => handleNumber(num.toString())}>
                    {num}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => handleOperator('*')}>×</Button>

                {[4, 5, 6].map(num => (
                  <Button key={num} variant="outline" size="sm" onClick={() => handleNumber(num.toString())}>
                    {num}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => handleOperator('-')}>−</Button>

                {[1, 2, 3].map(num => (
                  <Button key={num} variant="outline" size="sm" onClick={() => handleNumber(num.toString())}>
                    {num}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => handleOperator('+')}>+</Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => display !== '0' ? setDisplay('-' + display) : null}
                  className="col-span-1"
                >
                  ±
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleNumber('0')}>0</Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => !display.includes('.') ? setDisplay(display + '.') : null}
                >
                  .
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleOperator('=')}
                  className="bg-primary"
                >
                  =
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}