// ABOUTME: Design system showcase page demonstrating all UI components
// Interactive examples with different variants and states

'use client';


import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Download, 
  Heart, 
  Mail, 
  Search, 
  Settings, 
  Star,
  Upload,
  User,
  Zap
} from 'lucide-react';
import React from 'react';

import { Header } from '@/components/layout/Header';
import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { Button, ButtonGroup } from '@/components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FeatureCard,
} from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';

export default function DesignSystemPage() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [activeNavItem, setActiveNavItem] = React.useState('home');

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const navigation = [
    { name: 'Dashboard', href: '#', icon: <Zap className="h-4 w-4" />, badge: 3 },
    { name: 'Projects', href: '#', icon: <Star className="h-4 w-4" /> },
    { name: 'Settings', href: '#', icon: <Settings className="h-4 w-4" /> },
  ];

  const user = {
    name: 'Jane Doe',
    email: 'jane@example.com',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        logo={
          <h1 className="text-xl font-bold gradient-text">Design System</h1>
        }
        navigation={navigation}
        user={user}
        onMenuClick={() => setMobileSidebarOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
            activeItem={activeNavItem}
            onItemClick={(item) => setActiveNavItem(item.id)}
            className="h-[calc(100vh-64px)]"
          />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
          activeItem={activeNavItem}
          onItemClick={(item) => {
            setActiveNavItem(item.id);
            setMobileSidebarOpen(false);
          }}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold mb-2">Component Library</h1>
              <p className="text-muted-foreground mb-8">
                A comprehensive design system for building beautiful interfaces
              </p>

              {/* Buttons Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Buttons</h2>
                
                <div className="space-y-6">
                  {/* Button Variants */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Button Variants</CardTitle>
                      <CardDescription>
                        Different button styles for various use cases
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="link">Link</Button>
                      <Button variant="glass">Glass</Button>
                    </CardContent>
                  </Card>

                  {/* Button Sizes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Button Sizes</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                    </CardContent>
                  </Card>

                  {/* Button States */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Button States</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <Button loading>Loading</Button>
                        <Button disabled>Disabled</Button>
                        <Button leftIcon={<Download className="h-4 w-4" />}>
                          Download
                        </Button>
                        <Button rightIcon={<ChevronRight className="h-4 w-4" />}>
                          Next
                        </Button>
                      </div>
                      <ButtonGroup>
                        <Button variant="outline">One</Button>
                        <Button variant="outline">Two</Button>
                        <Button variant="outline">Three</Button>
                      </ButtonGroup>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Inputs Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Form Elements</h2>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Input Fields</CardTitle>
                      <CardDescription>
                        Various input types with floating labels
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        helperText="We'll never share your email"
                        leftIcon={Mail}
                      />
                      <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                      />
                      <Input
                        label="Search"
                        placeholder="Search for anything..."
                        leftIcon={Search}
                        variant="filled"
                      />
                      <Input
                        label="Username"
                        error="Username is already taken"
                        defaultValue="john_doe"
                      />
                      <Textarea
                        label="Message"
                        placeholder="Type your message here..."
                        helperText="Maximum 500 characters"
                        rows={4}
                      />
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Cards Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Cards</h2>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Default Card</CardTitle>
                      <CardDescription>
                        A basic card with header and content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Cards are used to group related content and actions.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" variant="outline">Learn More</Button>
                    </CardFooter>
                  </Card>

                  <Card variant="elevated" interactive onClick={() => alert('Card clicked!')}>
                    <CardHeader>
                      <CardTitle>Elevated Card</CardTitle>
                      <CardDescription>
                        Click me for interaction
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This card has elevation and hover effects.
                      </p>
                    </CardContent>
                  </Card>

                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle>Glass Card</CardTitle>
                      <CardDescription>
                        Beautiful glassmorphism effect
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Perfect for modern, layered interfaces.
                      </p>
                    </CardContent>
                  </Card>

                  <FeatureCard
                    icon={<Heart className="h-6 w-6" />}
                    title="Feature Card"
                    description="With icon and animation"
                    variant="outline"
                  >
                    <p className="text-sm text-muted-foreground">
                      Icons help draw attention to key features.
                    </p>
                  </FeatureCard>

                  <FeatureCard
                    icon={<Upload className="h-6 w-6" />}
                    title="Upload Files"
                    description="Drag and drop support"
                    variant="elevated"
                    interactive
                  />

                  <FeatureCard
                    icon={<User className="h-6 w-6" />}
                    title="User Profile"
                    description="Manage your account"
                    variant="glass"
                  />
                </div>
              </section>

              {/* Animation Examples */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Animations</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Micro-interactions</CardTitle>
                    <CardDescription>
                      Smooth animations enhance user experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                      <motion.div
                        className="p-6 rounded-lg bg-primary-100 dark:bg-primary-900 text-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <p className="font-medium">Scale on Hover</p>
                      </motion.div>
                      
                      <motion.div
                        className="p-6 rounded-lg bg-secondary-100 dark:bg-secondary-900 text-center"
                        whileHover={{ rotate: 5 }}
                      >
                        <p className="font-medium">Rotate on Hover</p>
                      </motion.div>
                      
                      <motion.div
                        className="p-6 rounded-lg bg-accent-100 dark:bg-accent-900 text-center"
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <p className="font-medium">Pulse Animation</p>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}