# Poker Platform Dashboard

A modern React dashboard for poker operations with role-based portals (Super Admin, Manager, GRE, HR, Cashier, FNB) and white-label branding.

## Features

- **Modern UI**: Beautiful gradient design with dark theme
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Interactive Sidebar**: Navigation menu with active state
- **Real-time Stats**: Dashboard cards showing key metrics
- **Quick Actions**: Fast access to common tasks
- **KYC Management**: Review pending KYC requests
- **System Status**: Monitor system health
- **Super Admin (formerly Admin)**: Credit Management, Reports with CSV export, embedded FNB overview
- **Master Admin**: Cross-club control, clients, white-label settings, branding header
- **FNB Portal**: Menu & Inventory, Order Management, Reports, Supplier & Kitchen Ops

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Run on a different port (e.g., 3001):
```bash
PORT=3001 npm start
```

## Technologies Used

- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Gradient Design**: Beautiful color schemes

## Project Structure

```
src/
├── components/
│   ├── AdminDashboard.js          # Super Admin dashboard (Credit Mgmt, Reports CSV, FNB embed)
│   ├── AdminSignIn.js             # Super Admin sign-in
│   ├── MasterAdminDashboard.js    # Client master admin (clubs/clients/branding)
│   ├── MasterAdminSignIn.js       # Master admin sign-in
│   ├── FnbDashboard.js            # Food & Beverage portal
│   ├── FnbSignIn.js               # FNB sign-in
│   ├── BrandingHeader.js          # White-label header using /branding/logo.png
│   └── DashboardPage.js           # Manager portal (chat/players/registered/KYC/push)
├── App.js                         # Routes for all portals
├── index.js                       # Entry point
└── index.css                      # Global styles (Tailwind + Manrope font)
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Customization

The dashboard is fully customizable:

- **Colors**: Modify gradient colors in the component
- **Layout**: Adjust grid columns and spacing
- **Content**: Update menu items, stats, and sections
- **Styling**: Use Tailwind classes for quick styling changes

### White-Label Branding
- Place a client logo at `public/branding/logo.png` (PNG, transparent background recommended).
- The logo appears in the branding header and as the site favicon.

### Fonts
- The platform uses the Manrope font via Google Fonts and Tailwind `font-sans`.

## License

This project is for internal use only.

