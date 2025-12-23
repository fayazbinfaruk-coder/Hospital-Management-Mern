# Home Page Documentation

## Overview
A modern, interactive home page for the Hospital Management System with dynamic sliders showcasing hospital services and user authentication options.

## Features

### 🎠 Hero Slider Section
- **5 Dynamic Slides** with smooth transitions and fade effects
- **Personalized Content** based on user login status
- **Interactive Banners** for login/signup with redirect functionality
- **Auto-play** with 5-second intervals
- **Navigation Controls** - Previous/Next arrows and pagination dots

### Slide Content:
1. **Welcome Slide** - Introduction with signup/dashboard access
2. **Login/Appointment Slide** - Sign in prompt or appointment booking
3. **Ambulance Service** - 24/7 emergency service information
4. **Blood Request** - Blood donation and request services
5. **Test Results** - Online lab results access

### 🏥 Services Section
Four main service cards:
- **Book Doctor Appointment** - Schedule with qualified doctors
- **Emergency Ambulance** - 24/7 emergency response
- **Blood Request** - Find donors or donate blood
- **Test Results** - Secure online access to lab results

### ✨ Features Section
Highlights three key benefits:
- Easy Scheduling
- Expert Doctors
- 24/7 Support

### 📊 Statistics Section
Displays impressive numbers:
- 500+ Expert Doctors
- 10K+ Happy Patients
- 24/7 Emergency Service
- 15+ Years Experience

### 🎯 Call to Action (CTA)
- Appears only for non-logged-in users
- Dual buttons for Sign Up and Login
- Eye-catching gradient background

## Technical Implementation

### Dependencies Used
- **React** - Core framework
- **React Router DOM** - Navigation and routing
- **Swiper.js** - Advanced slider/carousel
- **React Icons** - Icon library (Font Awesome icons)
- **TailwindCSS** - Styling framework

### Key Components
```jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
```

### Swiper Modules
- **Navigation** - Arrow controls
- **Pagination** - Dot indicators
- **Autoplay** - Auto-advance slides
- **EffectFade** - Smooth fade transitions

## Routing

### Updated Routes in App.jsx
```jsx
<Route path="/" element={<Home />} />
<Route path="/home" element={<Home />} />
```

### Layout Updates
The Layout component now shows Header and Footer on the Home page for both logged-in and non-logged-in users.

## User Experience Flow

### For Non-Logged-In Users:
1. Land on Home page with hero slider
2. See signup/login prompts in slides 1-2
3. Click slide buttons → Redirect to Signup/Login
4. Browse services → Click any service → Redirect to Signup
5. Use CTA section at bottom → Sign Up or Login

### For Logged-In Users:
1. Land on Home page with personalized content
2. See service-specific slides (appointments, ambulance, etc.)
3. Click slide buttons → Redirect to Dashboard/Account
4. Browse services → Click any service → Redirect to Account
5. No CTA section (already logged in)

## Styling

### Color Scheme
- **Primary Blue**: `#0067FF`
- **Yellow**: `#FEB60D`
- **Purple**: `#9771FF`
- **Iris Blue**: `#01B5C5`
- **Heading**: `#181A1E`
- **Text**: `#4E545F`

### Gradient Backgrounds
Each slide has a unique gradient:
- Blue to Cyan
- Purple to Pink
- Red to Orange
- Pink to Red
- Green to Teal

### Responsive Design
- **Mobile**: Single column layout, hidden images
- **Tablet**: Optimized spacing
- **Desktop**: Full two-column layout with images

## Interactive Elements

### Hover Effects
- Service cards lift up and scale
- Buttons grow slightly
- Shadows intensify
- Colors transition smoothly

### Click Actions
All interactive elements redirect appropriately:
- Slide buttons → Login/Signup/Dashboard
- Service cards → Account page
- CTA buttons → Login/Signup
- Header links → Various pages

## Custom Styling (App.css)

```css
/* Swiper Navigation Buttons */
.swiper-button-next, .swiper-button-prev {
  color: white !important;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
}

/* Pagination Bullets */
.swiper-pagination-bullet-active {
  width: 30px !important;
  border-radius: 6px !important;
}
```

## Future Enhancements

Potential additions:
1. **Testimonials Slider** - Patient reviews
2. **Doctor Showcase** - Featured doctors carousel
3. **News/Blog Section** - Health tips and updates
4. **Appointment Quick Book** - Direct booking form
5. **Live Chat Integration** - Real-time support
6. **Accessibility Features** - Screen reader optimization
7. **Multi-language Support** - i18n implementation

## Usage

Simply navigate to:
- `http://localhost:5173/` (development)
- `http://localhost:5173/home`

The page automatically detects login status and adjusts content accordingly.

## Notes
- Images should be placed in `/src/assets/images/`
- Swiper CSS must be imported for proper styling
- Login state is checked via localStorage token
- All redirects use React Router's `useNavigate` hook
