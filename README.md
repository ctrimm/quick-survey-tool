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

## Running Locally

### Prerequisites

- Node.js (v16 or newer)
- A GitHub account
- A GitHub Personal Access Token with `repo` scope
  - Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
  - Generate new token, select `repo` scope
  - Copy the token for later use

### Setup Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/survey-creator.git
cd survey-creator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
VITE_GITHUB_OWNER=your-github-username
VITE_GITHUB_REPO=survey-creator
VITE_GITHUB_TOKEN=your-github-personal-access-token
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

### Local Development Notes
- Changes are saved to your GitHub repository in real-time
- The admin password can be configured in `src/constants/config.ts`
- Survey responses are stored as CSV files in the `surveys/` directory of your repository
- Each survey has its own directory with metadata and responses

## Deploying to GitHub Pages

### First-Time Setup

1. Create a new repository on GitHub

2. Update your repository settings:
- Go to repository Settings
- Go to Pages section
- Set source to "Deploy from a branch"
- Select "gh-pages" branch and "/(root)" folder
- Click Save

3. Add repository secrets:
- Go to repository Settings
- Click "Secrets and variables" → "Actions"
- Add the following secrets:
  ```
  VITE_GITHUB_OWNER=your-github-username
  VITE_GITHUB_REPO=your-repo-name
  VITE_GITHUB_TOKEN=your-github-token
  ```

4. Update the base URL in `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/', // Replace with your repository name
  // ... rest of config
})
```

### Deployment

1. Push your changes to GitHub:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. The GitHub Action will automatically deploy your changes

3. Your site will be available at:
```
https://yourusername.github.io/your-repo-name/
```

### Manual Deployment

If you prefer to deploy manually:

1. Build the project:
```bash
npm run build
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

## Configuration

### Customizing the Admin Password
The default admin password can be changed in `src/constants/config.ts`:
```typescript
export const CONFIG = {
  adminPassword: "your-chosen-password",
  // ... other config options
};
```

### Styling
- Modify theme colors in `tailwind.config.js`
- Update component styles in `src/components/ui/`
- Add custom CSS in `src/styles/globals.css`

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

## Security Notes

- The admin password is stored in plain text in the config file. For production use, consider implementing proper authentication.
- The GitHub token has repository access. Keep it secure and consider implementing token rotation.
- There's no rate limiting on survey submissions. Consider adding protection against spam.
- Survey data is public in your repository. Make sure not to collect sensitive information.

## Troubleshooting

### Common Issues

1. Blank Page After Deployment
- Check if the `base` in `vite.config.ts` matches your repository name
- Verify all assets are using relative paths
- Check browser console for errors

2. API Errors
- Verify your GitHub token has the correct permissions
- Check if your environment variables are set correctly
- Ensure repository name and owner are correct

3. Failed Deployments
- Make sure the gh-pages branch exists
- Check if GitHub Pages is enabled in repository settings
- Verify GitHub Action secrets are set correctly

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
