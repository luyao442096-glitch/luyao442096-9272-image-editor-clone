# API Setup

This project uses OpenRouter API with Google Gemini 2.5 Flash Image for:
- **Image Generation**: Generate images from text prompts or edit images based on prompts
- **Image Analysis**: Analyze uploaded images using vision capabilities

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenRouter API Configuration (Required)
# Get your API key from https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Site Configuration (Optional - for OpenRouter rankings)
SITE_URL=http://localhost:3000
SITE_NAME=Zlseren AI

# Supabase Configuration (Required for authentication)
# Get these from your Supabase project settings: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting API Keys

### OpenRouter API Key (Required)
1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

**Note:** OpenRouter API key is required for both image generation and analysis features.

### Supabase Configuration (Required for authentication)
1. Visit [Supabase](https://supabase.com/)
2. Sign up or log in
3. Create a new project or select an existing one
4. Go to **Settings** > **API**
5. Copy the **Project URL** and **anon/public key**
6. Add them to your `.env.local` file as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Google OAuth Setup (Required for Google login)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to **APIs & Services** > **Library**
   - Search for "Google+ API" and enable it
4. Configure the **OAuth consent screen**:
   - Go to **APIs & Services** > **OAuth consent screen**
   - Choose "External" user type
   - Fill in the required information (app name, user support email, etc.)
5. Create **OAuth 2.0 credentials**:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - Replace `<your-project-ref>` with your Supabase project reference (found in your Supabase project URL)
   - Copy the **Client ID** and **Client Secret**
6. Configure Google provider in Supabase:
   - Go to your Supabase project
   - Navigate to **Authentication** > **Providers**
   - Find **Google** and enable it
   - Enter the **Client ID** and **Client Secret** from Google Cloud Console
   - Save the configuration

## Usage

### Image Generation
1. Go to the generator page (`/generator`)
2. Enter your prompt in the "Prompt Input" field
3. Select aspect ratio and generation count
4. Click "Generate Now" to generate images
5. Generated images will appear in the output gallery

### Image Analysis
1. Upload an image in the generator page (Image-to-Image mode)
2. Enter a prompt/question about the image (default: "What is in this image?")
3. Click the eye icon on any uploaded image to analyze it
4. The AI analysis will appear below the image

## Features

- **Image Generation**: Generate images from text prompts using Google Gemini 2.5 Flash Image
- **Image-to-Image Editing**: Upload an image and modify it based on text prompts
- **Image Analysis**: Analyze uploaded images using Google Gemini 2.5 Flash Image vision capabilities
- **Custom Prompts**: Support for detailed prompts and questions
- **Multiple Aspect Ratios**: 1:1, 4:3, 3:4, 16:9, 9:16, and auto
- **Batch Generation**: Generate multiple images at once

## Troubleshooting

### API Key Issues
If you see an "API 密钥无效或缺失" error:
1. Check that your `.env.local` file exists in the root directory
2. Verify that `OPENROUTER_API_KEY` is set correctly
3. Restart your development server after adding the API key

### Rate Limits
If you encounter rate limit errors (429), you may need to:
- Wait a few minutes before trying again
- Upgrade your OpenRouter plan for higher limits

### Image Generation Issues
- Ensure you have entered a prompt in the "Main Prompt" field
- For image-to-image mode, make sure you have uploaded at least one image
- Check the browser console and server logs for detailed error messages

### Network Issues
If you see network connection errors:
- Check your internet connection
- Verify that OpenRouter API is accessible from your network
- Check firewall or proxy settings

