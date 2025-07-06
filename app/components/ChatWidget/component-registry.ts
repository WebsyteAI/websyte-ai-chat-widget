import React from 'react';

// Component registry types
export interface ComponentRegistry {
  [componentName: string]: React.ComponentType<any>;
}

export interface ParsedComponent {
  componentName: string;
  props: Record<string, any>;
}

// Parse component syntax like {{ComponentName prop1="value1" prop2="value2"}}
export function parseComponentSyntax(text: string): ParsedComponent | null {
  const componentRegex = /^{{\s*(\w+)(\s+[^}]*)?\s*}}$/;
  const match = text.match(componentRegex);
  
  if (!match) {
    return null;
  }
  
  const componentName = match[1];
  const propsString = match[2]?.trim() || '';
  
  // Parse props (simplified - supports key="value" format)
  const props: Record<string, any> = {};
  if (propsString) {
    const propRegex = /(\w+)="([^"]*)"/g;
    let propMatch;
    while ((propMatch = propRegex.exec(propsString)) !== null) {
      props[propMatch[1]] = propMatch[2];
    }
  }
  
  return { componentName, props };
}

// Render a component from the registry
export function renderComponent(
  componentName: string, 
  props: Record<string, any>, 
  registry: ComponentRegistry
): React.ReactElement | null {
  const Component = registry[componentName];
  if (!Component) {
    return null;
  }
  
  return React.createElement(Component, props);
}

// Default empty registry
export const defaultComponentRegistry: ComponentRegistry = {};