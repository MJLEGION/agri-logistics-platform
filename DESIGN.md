# Agri-Logistics Platform - Design Documentation

## Design Process

### Problem Statement
Post-harvest losses in Rwanda due to poor market access, lack of transportation, and information gaps between farmers, buyers, and transporters.

### Target Users
- **Farmers**: List and sell crops
- **Buyers**: Browse and purchase produce
- **Transporters**: Accept delivery jobs

### Design Principles
1. **Simplicity**: Minimal clicks to complete tasks
2. **Color Coding**: Green (farmers), Orange (buyers), Blue (transporters)
3. **Mobile-First**: Most users access via smartphones
4. **Feedback**: Immediate confirmation for all actions

---

## User Flows
### Farmer Flow
### Buyer Flow
### Transporter Flow
---

## Style Guide

### Colors
**Light Mode**
- Primary (Farmer): `#2E7D32` Green
- Secondary (Buyer): `#FF9800` Orange
- Tertiary (Transporter): `#2196F3` Blue
- Background: `#F5F5F5`, Text: `#333333`

**Dark Mode**
- Background: `#121212`, Card: `#1E1E1E`, Text: `#FFFFFF`

### Typography
- Page Title: 24px bold
- Card Title: 20px bold
- Body Text: 16px regular
- Small Text: 12px regular

### Spacing
- Standard padding: 15px
- Card border radius: 12px
- Button border radius: 8px

---

## Technology Stack

### Why React Native (not HTML/CSS/JS)?
1. **Mobile-First**: 80%+ Rwanda users access via mobile
2. **Native Performance**: Better than web browsers
3. **Offline Support**: Critical for rural areas with poor connectivity
4. **Cross-Platform**: Single codebase for iOS and Android
5. **Future Features**: GPS, camera, push notifications, mobile payments

**Stack:**
- Framework: React Native + Expo
- Language: TypeScript
- State: Redux Toolkit
- Navigation: React Navigation
- Styling: StyleSheet (CSS-in-JS)

---

## Component Library

### 1. Card Component
Reusable container with theme adaptation
```typescript
<Card>
  <Text>Content here</Text>
</Card>
<ThemeToggle />
---

**Version**: 1.0  
**Last Updated**: October 2025