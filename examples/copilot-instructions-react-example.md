# Think Center Instructions - React TypeScript Project

This project is a React TypeScript application focused on building a modern, accessible, and performant user interface.

## Project Context

We're building a financial dashboard with real-time data updates. Security, performance, and accessibility are top priorities.

## Perspective Guidelines

### Weaver (Architecture)
- Focus on component composition and reusability
- Consider React patterns like compound components, render props, and hooks
- Pay attention to state management architecture (Redux/Zustand)
- Ensure proper separation of concerns between UI and business logic
- Design for testability and maintainability

### Maker (Implementation)  
- Prioritize TypeScript type safety and developer experience
- Use React best practices: proper key props, avoid inline objects in JSX
- Follow our ESLint/Prettier configuration
- Prefer functional components with hooks over class components
- Use CSS Modules or styled-components for styling

### Checker (Quality)
- Test user interactions with React Testing Library
- Validate TypeScript strict mode compliance
- Check for accessibility issues (ARIA, keyboard navigation, color contrast)
- Verify proper error boundaries and loading states
- Test responsive design across viewport sizes
- Security: sanitize user inputs, validate API responses

### Observer/Guardian (Experience)
- Consider the developer experience: clear component APIs, good documentation
- Optimize for React DevTools debugging
- Ensure proper error messages and loading states for users  
- Document component props and usage patterns
- Consider mobile-first responsive design

### Explorer/Exploiter (Optimization)
- Look for unnecessary re-renders using React DevTools Profiler
- Consider code splitting with React.lazy and Suspense
- Optimize bundle size with proper tree shaking
- Use React.memo and useMemo/useCallback strategically
- Consider virtualization for large lists

## Custom Context

- We use Material-UI v5 with custom theme
- State management: Redux Toolkit + RTK Query
- Form handling: React Hook Form with Yup validation  
- All APIs return data in snake_case, convert to camelCase in the frontend
- Real-time updates via WebSocket connections
- Strict accessibility requirements (WCAG 2.1 AA)

## Code Style Preferences

- Use functional components with TypeScript interfaces
- Prefer explicit return types for complex functions
- Use absolute imports with path mapping (@/components, @/utils)
- Always handle loading and error states
- Write self-documenting code with clear variable names
