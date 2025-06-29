// ABOUTME: Template engine for rendering layouts on dot grid pages
// Handles template data structures, rendering, scaling, and persistence

import { nanoid } from 'nanoid';

// Template categories
export type TemplateCategory = 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'habit' 
  | 'finance' 
  | 'project' 
  | 'health' 
  | 'custom';

// Base element types that can be placed on a grid
export type TemplateElementType = 
  | 'text' 
  | 'box' 
  | 'checkbox' 
  | 'tracker' 
  | 'divider' 
  | 'calendar' 
  | 'chart';

// Grid position and size
export interface GridPosition {
  x: number; // Grid column
  y: number; // Grid row
  width: number; // Grid cells wide
  height: number; // Grid cells tall
}

// Base template element
export interface TemplateElement {
  id: string;
  type: TemplateElementType;
  position: GridPosition;
  content?: string;
  style?: {
    color?: string;
    fontSize?: 'small' | 'medium' | 'large';
    fontWeight?: 'normal' | 'bold';
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    borderWidth?: number;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  config?: Record<string, any>; // Type-specific configuration
}

// Specific element types
export interface TextElement extends TemplateElement {
  type: 'text';
  content: string;
}

export interface BoxElement extends TemplateElement {
  type: 'box';
  label?: string;
}

export interface CheckboxElement extends TemplateElement {
  type: 'checkbox';
  label: string;
  checked?: boolean;
}

export interface TrackerElement extends TemplateElement {
  type: 'tracker';
  config: {
    rows: number;
    columns: number;
    labels?: string[];
    colorScheme?: string[];
  };
}

export interface CalendarElement extends TemplateElement {
  type: 'calendar';
  config: {
    month?: number;
    year?: number;
    showWeekNumbers?: boolean;
  };
}

// Template definition
export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description?: string;
  thumbnail?: string;
  elements: TemplateElement[];
  gridSize: {
    columns: number;
    rows: number;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    tags?: string[];
    isDefault?: boolean;
    isFavorite?: boolean;
  };
}

// Template instance (when applied to a page)
export interface TemplateInstance {
  id: string;
  templateId: string;
  pageId: number;
  appliedAt: Date;
  position: { x: number; y: number }; // Position on the page
  scale: number; // Scale factor
  elements: TemplateElement[]; // Instantiated elements with actual values
}

// Template rendering options
export interface RenderOptions {
  gridCellSize: number; // Size of each grid cell in pixels
  showGrid: boolean;
  snapToGrid: boolean;
  scale?: number;
  offset?: { x: number; y: number };
}

export class TemplateEngine {
  private templates: Map<string, Template> = new Map();
  private instances: Map<string, TemplateInstance> = new Map();

  // Create a new template
  createTemplate(params: {
    name: string;
    category: TemplateCategory;
    description?: string;
    gridSize: { columns: number; rows: number };
  }): Template {
    const template: Template = {
      id: nanoid(),
      name: params.name,
      category: params.category,
      description: params.description,
      elements: [],
      gridSize: params.gridSize,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      },
    };

    this.templates.set(template.id, template);
    return template;
  }

  // Add element to template
  addElement(templateId: string, element: Omit<TemplateElement, 'id'>): TemplateElement {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    const newElement: TemplateElement = {
      ...element,
      id: nanoid(),
    };

    template.elements.push(newElement);
    template.metadata.updatedAt = new Date();
    
    return newElement;
  }

  // Apply template to a page
  applyTemplate(
    templateId: string, 
    pageId: number, 
    position: { x: number; y: number },
    scale: number = 1
  ): TemplateInstance {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');

    const instance: TemplateInstance = {
      id: nanoid(),
      templateId,
      pageId,
      appliedAt: new Date(),
      position,
      scale,
      elements: this.instantiateElements(template.elements, scale),
    };

    this.instances.set(instance.id, instance);
    return instance;
  }

  // Create instances of template elements with scaling
  private instantiateElements(
    elements: TemplateElement[], 
    scale: number
  ): TemplateElement[] {
    return elements.map(element => ({
      ...element,
      id: nanoid(),
      position: {
        x: element.position.x * scale,
        y: element.position.y * scale,
        width: element.position.width * scale,
        height: element.position.height * scale,
      },
    }));
  }

  // Render template to canvas coordinates
  renderToCanvas(
    instance: TemplateInstance,
    options: RenderOptions
  ): Array<{
    element: TemplateElement;
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }> {
    const { gridCellSize, offset = { x: 0, y: 0 } } = options;

    return instance.elements.map(element => {
      const bounds = {
        x: (instance.position.x + element.position.x) * gridCellSize + offset.x,
        y: (instance.position.y + element.position.y) * gridCellSize + offset.y,
        width: element.position.width * gridCellSize,
        height: element.position.height * gridCellSize,
      };

      return { element, bounds };
    });
  }

  // Get grid-aligned position
  snapToGrid(position: { x: number; y: number }, gridSize: number): { x: number; y: number } {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }

  // Save templates to storage
  async saveTemplates(): Promise<void> {
    const templatesData = Array.from(this.templates.values());
    localStorage.setItem('bujo-templates', JSON.stringify(templatesData));
  }

  // Load templates from storage
  async loadTemplates(): Promise<void> {
    const stored = localStorage.getItem('bujo-templates');
    if (stored) {
      const templatesData: Template[] = JSON.parse(stored);
      templatesData.forEach(template => {
        this.templates.set(template.id, template);
      });
    }
  }

  // Get templates by category
  getTemplatesByCategory(category: TemplateCategory): Template[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }

  // Search templates
  searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values())
      .filter(template => 
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description?.toLowerCase().includes(lowerQuery) ||
        template.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
  }

  // Export template
  exportTemplate(templateId: string): string {
    const template = this.templates.get(templateId);
    if (!template) throw new Error('Template not found');
    
    return JSON.stringify(template, null, 2);
  }

  // Import template
  importTemplate(templateData: string): Template {
    const template: Template = JSON.parse(templateData);
    template.id = nanoid(); // Generate new ID to avoid conflicts
    
    this.templates.set(template.id, template);
    return template;
  }
}

// Default templates factory
export function createDefaultTemplates(): Template[] {
  const engine = new TemplateEngine();
  const templates: Template[] = [];

  // Daily Log Template
  const dailyLog = engine.createTemplate({
    name: 'Daily Log',
    category: 'daily',
    description: 'Simple daily bullet journal layout',
    gridSize: { columns: 20, rows: 30 },
  });

  // Add date header
  engine.addElement(dailyLog.id, {
    type: 'text',
    position: { x: 0, y: 0, width: 10, height: 2 },
    content: 'Date: ___________',
    style: { fontSize: 'large', fontWeight: 'bold' },
  });

  // Add sections
  engine.addElement(dailyLog.id, {
    type: 'box',
    position: { x: 0, y: 3, width: 20, height: 10 },
    label: 'Tasks',
  });

  engine.addElement(dailyLog.id, {
    type: 'box',
    position: { x: 0, y: 14, width: 20, height: 8 },
    label: 'Notes',
  });

  engine.addElement(dailyLog.id, {
    type: 'box',
    position: { x: 0, y: 23, width: 20, height: 6 },
    label: 'Reflection',
  });

  templates.push(dailyLog);

  // Add more default templates here...

  return templates;
}

// Singleton instance
export const templateEngine = new TemplateEngine();