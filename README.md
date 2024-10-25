# Survey Creator Tool

A simple, self-contained survey creation and management tool that stores responses directly in your GitHub repository as CSV files. Perfect for small projects, internal surveys, or proof of concepts where you want to maintain full control of your data.

## Features

- 🔒 Password-protected survey creation
- 📝 Multiple question types supported:
  - Short text answers
  - Long text answers
  - Multiple choice (radio buttons)
  - Checkboxes (multiple selection)
- 📊 Results stored as CSV files in your repository
- 🔗 Shareable survey links
- 📈 Basic results visualization
- 🎨 Customizable styling and branding

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- A GitHub account
- A GitHub Personal Access Token with `repo` scope

### Installation

1. Fork this repository
2. Clone your forked repository:
```bash
git clone https://github.com/your-username/survey-creator.git
cd survey-creator
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env.local` file in the root directory:
```env
VITE_GITHUB_OWNER=your-github-username
VITE_GITHUB_REPO=survey-creator
VITE_GITHUB_TOKEN=your-github-personal-access-token
```

5. Update the configuration in `src/constants/config.ts`:
```typescript
export const CONFIG = {
  adminPassword: "your-chosen-password", // Password for creating surveys
  logoUrl: "/your-logo.png",            // Your logo path
  primaryColor: "#your-color-code"      // Your brand color
} as const;
```

6. Start the development server:
```bash
npm run dev
```

### Deployment to GitHub Pages

1. In your repository settings, enable GitHub Pages and set it to deploy from the `gh-pages` branch

2. Add your environment variables to GitHub Pages:
   - Go to your repository settings
   - Navigate to "Environments" → "github-pages"
   - Add your environment variables (VITE_GITHUB_OWNER, VITE_GITHUB_REPO, VITE_GITHUB_TOKEN)

3. Deploy your application:
```bash
npm run deploy
```

## Usage

### Creating a Survey

1. Navigate to your deployed application
2. Click "Admin Login" and enter your admin password
3. Click "Create New Survey"
4. Fill in the survey details:
   - Title
   - Description
   - Add questions using the question type buttons
5. Click "Create Survey" to save

### Sharing a Survey

1. After creating a survey, copy the survey ID from the admin dashboard
2. Share the URL: `https://your-username.github.io/survey-creator/survey/[SURVEY_ID]`

### Viewing Results

1. Log in to the admin dashboard
2. Find your survey in the list
3. Click "View Results"

### Accessing the Data

Survey data is stored in your repository under the `surveys` directory:
```
surveys/
  ├── [survey-id]/
  │   ├── survey.csv     # Survey metadata and questions
  │   └── responses.csv  # Individual responses
```

## Customization

### Styling

1. Update theme colors in `tailwind.config.js`
2. Modify component styles in `src/components/ui/`
3. Add custom CSS in `src/styles/globals.css`

### Components

All UI components are built with [shadcn/ui](https://ui.shadcn.com/) and can be customized:
- Buttons (`src/components/ui/button.tsx`)
- Inputs (`src/components/ui/input.tsx`)
- Cards (`src/components/ui/card.tsx`)
- etc.

## Project Structure

```
src/
├── components/         # Reusable UI components
│   └── ui/            # Base UI components
├── constants/         # Configuration and constants
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and classes
├── pages/            # Page components
├── styles/           # Global styles
└── types/            # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## Security Considerations

- The admin password is stored in plain text in the config file. For production use, consider implementing proper authentication.
- The GitHub token has repository access. Keep it secure and consider implementing token rotation.
- There's no rate limiting on survey submissions. Consider adding protection against spam.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.