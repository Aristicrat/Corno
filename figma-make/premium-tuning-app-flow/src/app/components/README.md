# Corno - Premium Tuning App

## Design System Documentation

### Color Tokens

#### Background Colors
- `--tuner-bg-primary`: #0a0a0f (Main background)
- `--tuner-bg-secondary`: #12121a (Secondary surfaces)
- `--tuner-bg-card`: #1a1a26 (Card backgrounds)
- `--tuner-bg-elevated`: #22222e (Elevated elements)

#### Accent Colors
- `--tuner-accent-blue`: #00d4ff (Primary accent - Electric blue)
- `--tuner-accent-purple`: #a855f7 (Secondary accent - Soft purple)
- `--tuner-accent-emerald`: #10b981 (Success accent - Emerald green)

#### State Colors
- `--tuner-success`: #10b981 (In-tune state)
- `--tuner-warning`: #f59e0b (Approaching tune)
- `--tuner-error`: #ef4444 (Out of tune)

#### Text Colors
- `--tuner-text-primary`: #ffffff (Primary text)
- `--tuner-text-secondary`: #9ca3af (Secondary text)
- `--tuner-text-tertiary`: #6b7280 (Tertiary/muted text)

---

## User Flow

### 1. Splash Screen (`/`)
**Duration**: 2.5 seconds  
**Purpose**: Brand introduction and loading transition

**Visual Elements**:
- Centered logo with "Corno" wordmark
- Animated particle background (approaching state)
- Subtle neon glow effect
- Fade-in animation with scale transform
- Auto-navigates to onboarding

**Animations**:
- Logo: opacity 0→1, scale 0.8→1 (800ms, ease-out)
- Underline: scaleX 0→1 (600ms, delay 800ms)

---

### 2. Onboarding Screen (`/onboarding`)
**Steps**: 3 screens  
**Purpose**: Educate users on particle-based tuning concept

**Screen 1**: Visual Feedback
- Icon: Disc3
- Explains particle reaction to pitch

**Screen 2**: Perfect Precision
- Icon: Target
- Shows convergence behavior

**Screen 3**: Stay in Tune
- Icon: Circle
- Highlights professional accuracy

**Interaction**:
- Progress dots (1-3) at top
- Primary CTA button (blue with glow)
- Skip option available
- Swipe-like transitions between steps

**Animations**:
- Content: opacity + x-axis slide (400ms)
- Icon: scale + opacity (500ms, delay 100ms)
- Each step animates in sequence

---

### 3. Main Tuner Screen (`/tuner`)
**Purpose**: Core tuning experience - THE HERO SCREEN

**Layout Structure**:

#### Top Navigation Bar
- Left: Library icon → Presets
- Center: "Corno" wordmark
- Right: Settings icon → Settings

#### Center Display (Full-screen particle field)
**Particle System States**:

1. **Out of Tune**
   - Particles: Drift chaotically, gray color (#64748b)
   - Movement: High random velocity, low damping
   - Connections: None
   - Status: "Adjust pitch"

2. **Approaching**
   - Particles: Begin converging, blue glow (#00d4ff)
   - Movement: Medium damping, circular formation (80px radius)
   - Connections: Faint lines between nearby particles
   - Status: "Almost there..."

3. **In Tune** ✓
   - Particles: Stable symmetrical pattern, emerald glow (#10b981)
   - Movement: High damping, tight circle (50px radius)
   - Connections: Strong lines creating web pattern
   - Status: "✓ In Tune"

**Visual Indicators**:
- Large note display (e.g., "A4") with dynamic glow
- Frequency readout (440.00 Hz)
- Horizontal cents meter (-50 to +50)
- Real-time cent deviation (±XX cents)
- Vertical center line (subtle guide)

#### Bottom Controls
- Instrument selector dropdown
- Visual listening indicator
- Haptic feedback status

**Physics Parameters**:
- 150 particles by default
- 60fps animation loop (requestAnimationFrame)
- Spring-based damping
- Radial formation around center

---

### 4. Presets Library (`/presets`)
**Purpose**: Quick access to saved tunings

**Layout**:
- Grid of preset cards
- Each card shows:
  - Colored icon
  - Preset name
  - Tuning notation (e.g., "E A D G B E")
  - Status indicator dot

**Default Presets**:
1. Standard Guitar (Blue)
2. Drop D (Purple)
3. Bass 4-String (Emerald)
4. Violin (Orange)
5. Piano (Blue)
6. Voice (Purple)

**Actions**:
- Tap card → Navigate to tuner with preset
- Plus button → Create custom tuning
- Back button → Return to tuner

**Animations**:
- Cards stagger-in on mount (50ms delay each)
- Tap scale feedback (0.98)

---

### 5. Settings Screen (`/settings`)
**Purpose**: Customize app behavior and appearance

**Sections**:

#### Theme Selection
- Dark (default - #0a0a0f)
- Midnight (#0f0820)
- Light (#f8f9fa)
- Visual preview squares

#### Audio Calibration
- Range: 430-450 Hz
- Default: A440 Hz
- Slider with live value display
- Info tooltip

#### Particle Density
- Range: 0-100%
- Default: 75%
- Controls particle count in visualization

#### Haptic Feedback
- Toggle switch
- Vibrates when reaching in-tune state
- Animated switch with spring physics

#### App Info
- Version number
- Build date
- Legal links (Privacy, Terms, Support)

**Interaction Notes**:
- All sliders use custom styling with neon glow
- Toggle uses smooth spring animation
- Settings persist in localStorage (future: Supabase)

---

## Component Architecture

### ParticleField.tsx
**Props**:
- `tuningState`: "outOfTune" | "approaching" | "inTune"
- `accentColor`: Hex color string
- `particleCount`: Number of particles (default: 150)

**Rendering**:
- Canvas-based (hardware accelerated)
- Responsive to window resize
- DevicePixelRatio scaling for retina displays

**Physics Logic**:
- Each particle has: position, velocity, base position, size, alpha
- Circular formation calculated using polar coordinates
- Spring-based attraction to base position
- Damping varies by state
- Connection lines drawn when distance < 100px

---

## Animation Specifications

### Motion Library Usage
All animations use Motion (formerly Framer Motion)

**Easing Curves**:
- Primary: `[0.22, 1, 0.36, 1]` (Custom ease-out)
- Buttons: `{ type: "spring", stiffness: 500, damping: 30 }`
- Sliders: `{ type: "spring", stiffness: 200, damping: 30 }`

**Micro-interactions**:
- Button tap: `whileTap={{ scale: 0.98 }}`
- Icon appearance: opacity + scale transform
- Page transitions: opacity + x-axis slide

**Particle Transitions**:
- State changes animate over 1-2 seconds
- Smooth damping creates organic feel
- No abrupt jumps in position

---

## Accessibility Notes

- High contrast ratios for text on dark backgrounds
- Touch targets minimum 44x44px
- Visual state indicators (not color alone)
- Reduced motion support (future enhancement)
- Screen reader labels on interactive elements

---

## Technical Stack

- **Framework**: React 18.3.1
- **Routing**: React Router 7 (Data mode)
- **Animation**: Motion 12.23.24
- **Styling**: Tailwind CSS 4.1.12
- **Icons**: Lucide React
- **Canvas**: Native HTML5 Canvas API

---

## Future Enhancements

1. **Real Microphone Input**
   - Web Audio API integration
   - Pitch detection algorithm (autocorrelation)
   - FFT analysis

2. **Cloud Sync**
   - Supabase integration for preset sync
   - User accounts
   - Cross-device preset library

3. **Advanced Features**
   - Strobe tuner mode
   - Polyphonic tuning
   - Tuning history
   - Note frequency training mode

4. **Customization**
   - Custom particle shapes
   - User-defined color schemes
   - Animation speed control
   - Dark/light theme with custom accent picker

---

## Design Principles

1. **Minimalism**: Clean UI, no clutter
2. **Tactile**: Smooth animations, haptic feedback
3. **Immersive**: Full-screen particle field
4. **Professional**: High-end aesthetic
5. **Clarity**: Visual hierarchy, readable typography
6. **Delight**: Subtle animations, glowing accents

---

## App Store Readiness

✓ Complete user flow  
✓ Polished animations  
✓ Consistent design system  
✓ Professional typography  
✓ Dark mode optimized  
✓ iOS-first design language  
✓ Responsive layouts  
✓ Touch-optimized interactions  

---

*Corno - Where precision meets beauty*
