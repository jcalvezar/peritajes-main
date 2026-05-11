# UI Components Specification

## Overview

Shared UI components for both frontend (Next.js) and app-mobile (React Native).

## Common Components

### Button

```typescript
interface IButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Variants:**
| Variant | Description | Use Case |
|---------|-------------|----------|
| primary | Filled, main action | Submit, Save |
| secondary | Filled, secondary | Cancel, Back |
| outline | Border only | Alternative actions |
| text | No border, text only | Tertiary actions |

### Input

```typescript
interface IInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}
```

### Select

```typescript
interface ISelectProps {
  label?: string;
  options: { value: string | number; label: string }[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}
```

### Card

```typescript
interface ICardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  elevated?: boolean;
}
```

### StatusBadge

```typescript
interface IStatusBadgeProps {
  status: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
}
```

### DataTable

```typescript
interface IDataTableProps {
  columns: {
    key: string;
    header: string;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  data: any[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: any) => void;
  pagination?: {
    page: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}
```

### Modal

```typescript
interface IModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}
```

### Alert

```typescript
interface IAlertProps {
  severity?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}
```

### Spinner

```typescript
interface ISpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'inherit';
}
```

### EmptyState

```typescript
interface IEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## Layout Components

### PageHeader

```typescript
interface IPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}
```

### Sidebar

```typescript
interface ISidebarProps {
  open: boolean;
  onClose: () => void;
  items: {
    label: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }[];
  footer?: React.ReactNode;
}
```

### Drawer

```typescript
interface IDrawerProps {
  open: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  children: React.ReactNode;
  width?: number | string;
}
```

---

## Form Components

### FormField

Wrapper that combines Label + Input + Error + HelperText.

```typescript
interface IFormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}
```

### DatePicker

```typescript
interface IDatePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  error?: string;
}
```

### FileUpload

```typescript
interface IFileUploadProps {
  label?: string;
  accept?: string;          // e.g., "image/*"
  multiple?: boolean;
  onUpload?: (files: File[]) => void;
  preview?: boolean;
  error?: string;
}
```

---

## Theme Variables

### Colors

```css
:root {
  /* Primary */
  --color-primary-50: #e3f2fd;
  --color-primary-100: #bbdefb;
  --color-primary-500: #2196f3;
  --color-primary-700: #1976d2;
  --color-primary-900: #0d47a1;

  /* Semantic */
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-error: #f44336;
  --color-info: #2196f3;

  /* Neutral */
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #eeeeee;
  --color-gray-300: #e0e0e0;
  --color-gray-400: #bdbdbd;
  --color-gray-500: #9e9e9e;
  --color-gray-600: #757575;
  --color-gray-700: #616161;
  --color-gray-800: #424242;
  --color-gray-900: #212121;
}
```

### Spacing

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
}
```

### Border Radius

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

---

## Mobile Components (React Native)

### Touchable

```typescript
interface ITouchableProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}
```

### ListItem

```typescript
interface IListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}
```

### BottomSheet

```typescript
interface IBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];  // percentages
}
```

### Header

```typescript
interface IHeaderProps {
  title: string;
  leftAction?: { icon: React.ReactNode; onPress: () => void };
  rightAction?: { icon: React.ReactNode; onPress: () => void };
}
```
