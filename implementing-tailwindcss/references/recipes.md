# Tailwind CSS v4 Recipes

Common styling tasks and their solutions using Tailwind CSS v4.

## Creating Custom Design Tokens

### Adding New Color Tokens

**Step 1**: Define in global.css:

```css
/* src/styles/global.css */
@theme inline {
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}

:root {
  --success: #16a34a;
  --success-foreground: #ffffff;
  --warning: #f59e0b;
  --warning-foreground: #000000;
}

.dark {
  --success: #22c55e;
  --success-foreground: #000000;
  --warning: #fbbf24;
  --warning-foreground: #000000;
}
```

**Step 2**: Use in components:

```tsx
<div className="bg-success text-success-foreground">
  Success message
</div>

<button className="bg-warning text-warning-foreground hover:bg-warning/90">
  Warning action
</button>
```

### Adding Custom Spacing Values

```css
@theme inline {
  --space-5xl: 8rem; /* 128px */
  --space-6xl: 12rem; /* 192px */

  --spacing-40: var(--space-5xl);
  --spacing-48: var(--space-6xl);
}
```

Usage:

```tsx
<div className="gap-40">   {/* 128px */}
<div className="p-48">     {/* 192px */}
```

### Adding Custom Breakpoints

```css
@theme inline {
  --breakpoint-3xl: 1920px;
  --breakpoint-4xl: 2560px;
}
```

Usage:

```tsx
<div className="text-base 3xl:text-lg 4xl:text-xl">
```

## Responsive Layout Recipes

### Dashboard with Collapsible Sidebar

```tsx
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r",
          "transform transition-transform lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="p-4 space-y-2">{/* Navigation items */}</nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center px-4">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold ml-4">Dashboard</h1>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Overlay on mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
```

### Responsive Data Grid

```tsx
export function DataGrid({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">{item.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </CardContent>
          <CardFooter>
            <Button size="sm" className="w-full">
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

### Two-Column Content with Sidebar

```tsx
export function ContentWithSidebar() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      {/* Main content */}
      <article className="space-y-4">
        <h1 className="text-2xl font-bold">Article Title</h1>
        <div className="prose">
          <p>Content here...</p>
        </div>
      </article>

      {/* Sidebar */}
      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Related Articles</CardTitle>
          </CardHeader>
          <CardContent>{/* Related content */}</CardContent>
        </Card>
      </aside>
    </div>
  );
}
```

## Form Styling Patterns

### Two-Column Form with Responsive Layout

```tsx
export function UserForm() {
  return (
    <form className="space-y-6">
      {/* Name fields - side by side on larger screens */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="First Name">
          <Input placeholder="John" />
        </FormField>
        <FormField label="Last Name">
          <Input placeholder="Doe" />
        </FormField>
      </div>

      {/* Email - full width */}
      <FormField label="Email">
        <Input type="email" placeholder="john@example.com" />
      </FormField>

      {/* Address fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="City" className="sm:col-span-1">
          <Input placeholder="New York" />
        </FormField>
        <FormField label="State" className="sm:col-span-1">
          <Select>
            <option>NY</option>
            <option>CA</option>
          </Select>
        </FormField>
      </div>

      {/* Actions - right-aligned on desktop */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" className="sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="sm:w-auto">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
```

### Input with Icon

```tsx
export function SearchInput() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" placeholder="Search..." className="pl-9" />
    </div>
  );
}
```

### Input with Button

```tsx
export function EmailInput() {
  return (
    <div className="flex gap-2">
      <Input type="email" placeholder="Enter your email" className="flex-1" />
      <Button>Subscribe</Button>
    </div>
  );
}
```

### Form with Validation States

```tsx
export function FormWithValidation() {
  const [errors, setErrors] = useState({});

  return (
    <form className="space-y-4">
      <FormField label="Email" error={errors.email}>
        <Input
          type="email"
          className={cn(
            errors.email && "border-destructive focus:ring-destructive/20",
          )}
          aria-invalid={!!errors.email}
        />
      </FormField>

      {errors.email && (
        <p className="text-sm text-destructive">{errors.email}</p>
      )}
    </form>
  );
}
```

## Card and Panel Layouts

### Basic Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Card with Separators (Atlas Style)

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-base font-semibold">Title</CardTitle>
  </CardHeader>

  {/* Dotted separator after header */}
  <div className="separator-dotted mx-6" />

  <CardContent className="space-y-4">
    <p>Content here</p>
  </CardContent>

  {/* Dashed separator before footer */}
  <div className="separator-dashed mx-6" />

  <CardFooter className="text-sm text-muted-foreground">Footer text</CardFooter>
</Card>
```

### Stat Card

```tsx
export function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  change?: { value: number; trend: "up" | "down" };
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs mt-2",
              change.trend === "up" ? "text-success" : "text-destructive",
            )}
          >
            {change.trend === "up" ? "↑" : "↓"} {Math.abs(change.value)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Card Grid

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  <StatCard title="Total Users" value="1,234" icon={Users} />
  <StatCard title="Revenue" value="$12,345" icon={DollarSign} />
  <StatCard title="Orders" value="456" icon={ShoppingCart} />
</div>
```

## Navigation Patterns

### Horizontal Nav with Active States

```tsx
export function MainNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/users", label: "Users" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="flex items-center gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href
              ? "text-foreground"
              : "text-muted-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
```

### Sidebar Nav with Icons

```tsx
export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

### Breadcrumbs

```tsx
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
```

## Button Variants

### Button with Loading State

```tsx
export function ButtonWithLoading() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await someAsyncOperation();
    setLoading(false);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      loading={loading}
      loadingText="Saving..."
    >
      Save Changes
    </Button>
  );
}
```

### Button Group

```tsx
export function ButtonGroup() {
  return (
    <div className="inline-flex rounded-lg border border-border overflow-hidden">
      <Button variant="ghost" className="rounded-none border-r">
        Option 1
      </Button>
      <Button variant="ghost" className="rounded-none border-r">
        Option 2
      </Button>
      <Button variant="ghost" className="rounded-none">
        Option 3
      </Button>
    </div>
  );
}
```

### Icon Button with Tooltip

```tsx
export function IconButtonWithTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Settings</p>
      </TooltipContent>
    </Tooltip>
  );
}
```

## Loading States

### Skeleton Loader

```tsx
export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-3 bg-muted animate-pulse rounded" />
        <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
```

### Loading Spinner

```tsx
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "border-2 border-current border-t-transparent rounded-full animate-spin",
        size === "sm" && "h-4 w-4",
        size === "md" && "h-6 w-6",
        size === "lg" && "h-8 w-8",
      )}
    />
  );
}
```

### Loading Overlay

```tsx
export function LoadingOverlay({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}
```

## Error States

### Error Alert

```tsx
export function ErrorAlert({ error }: { error: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
```

### Inline Error Message

```tsx
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
```

### Empty State

```tsx
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description}
      </p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
```

## Resources

- More patterns: `patterns.md`
- Complete examples: `examples.md`
- Atlas global styles: `/Users/josechifflet-mbp/Repos/atlas/src/styles/global.css`
