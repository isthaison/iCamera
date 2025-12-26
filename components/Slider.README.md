# Slider Component

A highly customizable, reusable slider component for React applications.

## Features

- **Horizontal & Vertical orientations**
- **Multiple sizes**: sm, md, lg
- **Custom value formatting**
- **Touch-friendly design**
- **Smooth animations**
- **Cross-browser compatibility**

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` | `number` | - | Minimum value |
| `max` | `number` | - | Maximum value |
| `step` | `number` | - | Step increment |
| `value` | `number` | - | Current value |
| `onChange` | `(value: number) => void` | - | Change handler |
| `label` | `string` | `undefined` | Label text |
| `showValue` | `boolean` | `true` | Show value display |
| `valueFormatter` | `(value: number) => string` | `undefined` | Custom value formatter |
| `className` | `string` | `''` | Additional CSS classes |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Slider orientation |
| `disabled` | `boolean` | `false` | Disable slider |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Slider size |

## Usage Examples

### Basic Horizontal Slider
```tsx
<Slider
  min={0}
  max={100}
  step={1}
  value={50}
  onChange={setValue}
  label="Volume"
/>
```

### Vertical Slider with Custom Formatting
```tsx
<Slider
  min={1}
  max={30000}
  step={1}
  value={shutterSpeed}
  onChange={setShutterSpeed}
  orientation="vertical"
  valueFormatter={(val) =>
    val >= 1000
      ? `${(val / 1000).toFixed(1)}s`
      : `1/${Math.round(1000 / val)}`
  }
/>
```

### Small Size Slider
```tsx
<Slider
  min={0}
  max={10}
  step={0.1}
  value={zoom}
  onChange={setZoom}
  size="sm"
  valueFormatter={(val) => `${val.toFixed(1)}x`}
/>
```

## Styling

The component includes built-in styling with:
- Yellow theme (#fbbf24)
- Smooth hover/active animations
- Touch-friendly thumb sizes
- Cross-browser compatibility (Webkit, Mozilla)
- Responsive design

## Dependencies

- React
- Tailwind CSS (for base styling)