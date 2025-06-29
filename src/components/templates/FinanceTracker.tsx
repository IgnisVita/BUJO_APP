// ABOUTME: Finance tracking templates for expense, budget, and savings
// Grid-aligned financial layouts for bullet journaling

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  CreditCard,
  Wallet,
  Target,
  Calendar,
  Plus,
  Minus,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { Template, templateEngine } from '@/lib/templates/template-engine';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface FinanceTrackerProps {
  onSaveTemplate?: (template: Template) => void;
  defaultView?: 'expense' | 'budget' | 'savings' | 'bills';
  gridCellSize?: number;
  className?: string;
}

type TrackerView = 'expense' | 'budget' | 'savings' | 'bills';

interface ExpenseEntry {
  id: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
}

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: Date;
  color: string;
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // Day of month
  isPaid: boolean;
  isAutomatic: boolean;
}

const expenseCategories = [
  { name: 'Food & Dining', color: '#f59e0b' },
  { name: 'Transportation', color: '#3b82f6' },
  { name: 'Shopping', color: '#8b5cf6' },
  { name: 'Entertainment', color: '#ec4899' },
  { name: 'Bills & Utilities', color: '#ef4444' },
  { name: 'Healthcare', color: '#10b981' },
  { name: 'Education', color: '#6366f1' },
  { name: 'Other', color: '#6b7280' },
];

export const FinanceTracker: React.FC<FinanceTrackerProps> = ({
  onSaveTemplate,
  defaultView = 'expense',
  gridCellSize = 20,
  className,
}) => {
  const [view, setView] = useState<TrackerView>(defaultView);
  const [selectedMonth] = useState(new Date());
  
  // Expense tracking state
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([
    {
      id: '1',
      date: new Date(),
      description: 'Grocery shopping',
      category: 'Food & Dining',
      amount: 87.50,
      type: 'expense',
    },
    {
      id: '2',
      date: new Date(),
      description: 'Monthly salary',
      category: 'Income',
      amount: 3500,
      type: 'income',
    },
  ]);
  
  // Budget state
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(
    expenseCategories.map((cat, index) => ({
      id: `budget-${index}`,
      name: cat.name,
      budgeted: 500,
      spent: Math.random() * 500,
      color: cat.color,
    }))
  );
  
  // Savings goals state
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      target: 10000,
      current: 3500,
      color: '#10b981',
    },
    {
      id: '2',
      name: 'Vacation',
      target: 3000,
      current: 1200,
      deadline: new Date(2024, 11, 31),
      color: '#3b82f6',
    },
  ]);
  
  // Bills state
  const [bills, setBills] = useState<Bill[]>([
    {
      id: '1',
      name: 'Rent',
      amount: 1200,
      dueDay: 1,
      isPaid: true,
      isAutomatic: true,
    },
    {
      id: '2',
      name: 'Internet',
      amount: 60,
      dueDay: 15,
      isPaid: false,
      isAutomatic: true,
    },
  ]);

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    description: '',
    amount: '',
    category: 'Food & Dining',
    type: 'expense' as 'income' | 'expense',
  });

  // Calculate totals
  const totals = useMemo(() => {
    const income = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const spent = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    return {
      income,
      spent,
      balance: income - spent,
    };
  }, [expenses]);

  // Add new expense/income
  const addEntry = () => {
    if (!newEntry.description || !newEntry.amount) return;

    const entry: ExpenseEntry = {
      id: Date.now().toString(),
      date: new Date(),
      description: newEntry.description,
      category: newEntry.category,
      amount: parseFloat(newEntry.amount),
      type: newEntry.type,
    };

    setExpenses([...expenses, entry]);
    setNewEntry({
      description: '',
      amount: '',
      category: 'Food & Dining',
      type: 'expense',
    });
  };

  // Save as template
  const saveAsTemplate = () => {
    let gridSize;
    let templateName;

    switch (view) {
      case 'expense':
        gridSize = { columns: 20, rows: 25 };
        templateName = 'Expense Tracker';
        break;
      case 'budget':
        gridSize = { columns: 15, rows: 20 };
        templateName = 'Budget Planner';
        break;
      case 'savings':
        gridSize = { columns: 18, rows: 15 };
        templateName = 'Savings Tracker';
        break;
      case 'bills':
        gridSize = { columns: 20, rows: 35 };
        templateName = 'Bill Payment Tracker';
        break;
    }

    const template = templateEngine.createTemplate({
      name: `${templateName} - ${format(selectedMonth, 'MMM yyyy')}`,
      category: 'finance',
      description: `Track your ${view} with this organized layout`,
      gridSize,
    });

    // Add template elements based on view
    switch (view) {
      case 'expense':
        // Header
        templateEngine.addElement(template.id, {
          type: 'text',
          position: { x: 0, y: 0, width: 20, height: 2 },
          content: 'Expense Tracker',
          style: { fontSize: 'large', fontWeight: 'bold', textAlign: 'center' },
        });

        // Column headers
        const headers = ['Date', 'Description', 'Category', 'Amount'];
        headers.forEach((header, index) => {
          templateEngine.addElement(template.id, {
            type: 'text',
            position: { x: index * 5, y: 3, width: 5, height: 1 },
            content: header,
            style: { fontSize: 'small', fontWeight: 'bold' },
          });
        });

        // Entry rows
        for (let i = 0; i < 20; i++) {
          templateEngine.addElement(template.id, {
            type: 'box',
            position: { x: 0, y: 4 + i, width: 20, height: 1 },
            style: { borderStyle: 'solid', borderWidth: 1 },
          });
        }
        break;

      case 'budget':
        // Budget categories
        budgetCategories.forEach((cat, index) => {
          // Category name
          templateEngine.addElement(template.id, {
            type: 'text',
            position: { x: 0, y: index * 2, width: 6, height: 1 },
            content: cat.name,
            style: { fontSize: 'small', color: cat.color },
          });

          // Budget amount box
          templateEngine.addElement(template.id, {
            type: 'box',
            position: { x: 7, y: index * 2, width: 3, height: 1 },
            label: 'Budget',
          });

          // Spent amount box
          templateEngine.addElement(template.id, {
            type: 'box',
            position: { x: 11, y: index * 2, width: 3, height: 1 },
            label: 'Spent',
          });
        });
        break;

      case 'savings':
        // Savings goals
        savingsGoals.forEach((goal, index) => {
          // Goal name
          templateEngine.addElement(template.id, {
            type: 'text',
            position: { x: 0, y: index * 5, width: 10, height: 1 },
            content: goal.name,
            style: { fontSize: 'medium', fontWeight: 'bold', color: goal.color },
          });

          // Progress tracker
          templateEngine.addElement(template.id, {
            type: 'tracker',
            position: { x: 0, y: index * 5 + 1, width: 18, height: 3 },
            config: {
              rows: 1,
              columns: 10,
              colorScheme: [goal.color],
            },
          });
        });
        break;

      case 'bills':
        // Calendar grid for bills
        const daysInMonth = 31;
        for (let day = 1; day <= daysInMonth; day++) {
          // Day number
          templateEngine.addElement(template.id, {
            type: 'text',
            position: { x: ((day - 1) % 7) * 2.5, y: Math.floor((day - 1) / 7) * 4, width: 2, height: 1 },
            content: day.toString(),
            style: { fontSize: 'small', textAlign: 'center' },
          });

          // Bill checkboxes
          templateEngine.addElement(template.id, {
            type: 'checkbox',
            position: { x: ((day - 1) % 7) * 2.5, y: Math.floor((day - 1) / 7) * 4 + 1, width: 2, height: 2 },
            label: '',
          });
        }
        break;
    }

    onSaveTemplate?.(template);
  };

  // Render different views
  const renderView = () => {
    switch (view) {
      case 'expense':
        return (
          <div>
            {/* Entry form */}
            <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Add Entry</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Input
                  placeholder="Description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  className="col-span-2"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                />
                <select
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                  className="px-3 py-2 border rounded-lg bg-white dark:bg-neutral-700"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <Button 
                  onClick={addEntry}
                  variant={newEntry.type === 'income' ? 'default' : 'outline'}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setNewEntry({ ...newEntry, type: 'expense' })}
                  className={cn(
                    'text-sm px-3 py-1 rounded',
                    newEntry.type === 'expense' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  Expense
                </button>
                <button
                  onClick={() => setNewEntry({ ...newEntry, type: 'income' })}
                  className={cn(
                    'text-sm px-3 py-1 rounded',
                    newEntry.type === 'income' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Expense list */}
            <div className="space-y-2">
              {expenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    expense.type === 'income'
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {expense.type === 'income' ? (
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {expense.category} • {format(expense.date, 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'font-bold',
                    expense.type === 'income' 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}>
                    {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-4">
            {budgetCategories.map((category) => {
              const percentage = (category.spent / category.budgeted) * 100;
              const isOverBudget = percentage > 100;

              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className={isOverBudget ? 'text-red-600 dark:text-red-400' : ''}>
                        ${category.spent.toFixed(2)}
                      </span>
                      <span className="text-neutral-500"> / ${category.budgeted.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="relative h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.5 }}
                      className="absolute h-full rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {isOverBudget && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'savings':
        return (
          <div className="space-y-6">
            {savingsGoals.map((goal) => {
              const percentage = (goal.current / goal.target) * 100;
              
              return (
                <div key={goal.id} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg" style={{ color: goal.color }}>
                      {goal.name}
                    </h3>
                    <Target className="w-5 h-5" style={{ color: goal.color }} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    
                    <div className="relative h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                        className="absolute h-full rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: goal.color }}
                      >
                        <span className="text-white text-sm font-medium">
                          ${goal.current.toFixed(0)}
                        </span>
                      </motion.div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                      <span>Remaining: ${(goal.target - goal.current).toFixed(2)}</span>
                      {goal.deadline && (
                        <span>Due: {format(goal.deadline, 'MMM yyyy')}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'bills':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bills.map((bill) => (
                <motion.div
                  key={bill.id}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    'p-3 rounded-lg border-2 cursor-pointer transition-all',
                    bill.isPaid
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700'
                      : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600'
                  )}
                  onClick={() => setBills(bills.map(b => 
                    b.id === bill.id ? { ...b, isPaid: !b.isPaid } : b
                  ))}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{bill.name}</span>
                    {bill.isAutomatic && (
                      <CreditCard className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                  <div className="text-lg font-bold">${bill.amount}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Due: {bill.dueDay}th
                  </div>
                  {bill.isPaid && (
                    <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                      ✓ Paid
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Finance Tracker
          </h2>
          
          <Button onClick={saveAsTemplate} size="sm">
            Save as Template
          </Button>
        </div>

        {/* View tabs */}
        <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          {(['expense', 'budget', 'savings', 'bills'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'flex-1 px-3 py-2 rounded text-sm font-medium transition-all',
                view === v
                  ? 'bg-white dark:bg-neutral-700 shadow-sm'
                  : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-green-600 dark:text-green-400">Income</span>
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            ${totals.income.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-red-600 dark:text-red-400">Expenses</span>
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            ${totals.spent.toFixed(2)}
          </div>
        </div>
        
        <div className={cn(
          'rounded-lg p-4',
          totals.balance >= 0
            ? 'bg-blue-50 dark:bg-blue-900/20'
            : 'bg-orange-50 dark:bg-orange-900/20'
        )}>
          <div className="flex items-center justify-between mb-1">
            <span className={cn(
              'text-sm',
              totals.balance >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-orange-600 dark:text-orange-400'
            )}>Balance</span>
            <Wallet className={cn(
              'w-4 h-4',
              totals.balance >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-orange-600 dark:text-orange-400'
            )} />
          </div>
          <div className={cn(
            'text-2xl font-bold',
            totals.balance >= 0
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-orange-700 dark:text-orange-300'
          )}>
            ${Math.abs(totals.balance).toFixed(2)}
          </div>
        </div>
      </div>

      {/* View content */}
      {renderView()}
    </Card>
  );
};

export default FinanceTracker;