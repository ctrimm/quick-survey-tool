interface Config {
  githubOwner: string;
  githubRepo: string;
  githubToken: string;
}

export async function loadConfig(): Promise<Config> {
  // In development, use environment variables
  if (import.meta.env.DEV) {
    return {
      githubOwner: import.meta.env.VITE_GITHUB_OWNER || '',
      githubRepo: import.meta.env.VITE_GITHUB_REPO || '',
      githubToken: import.meta.env.VITE_GITHUB_TOKEN || ''
    };
  }

  // In production, load from config.json
  try {
    const response = await fetch('/quick-survey-tool/config.json');
    return await response.json();
  } catch (error) {
    console.error('Failed to load config:', error);
    return {
      githubOwner: '',
      githubRepo: '',
      githubToken: ''
    };
  }
}
