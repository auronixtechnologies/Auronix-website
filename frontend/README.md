# Frontend - Auronix Technologies

React frontend for Auronix Technologies portfolio platform.

## Overview

Modern, responsive React application built with:
- **React 18** - UI library
- **Vite** - Fast build tool
- **React Router** - Navigation
- **Modern CSS** - Responsive design

## Quick Start

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   copy .env.example .env
   # Default settings work for local dev
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`

## Project Structure

```
src/
├── components/              # Reusable components
│   ├── Navigation.jsx
│   ├── Navigation.css
│   ├── Footer.jsx
│   └── Footer.css
├── pages/                   # Page components
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Team.jsx
│   ├── Portfolio.jsx
│   ├── Contact.jsx
│   └── pages.css
├── services/
│   └── api.js              # API client
├── App.jsx                 # Main app component
├── App.css                 # Global styles
└── main.jsx                # Entry point

public/
└── index.html
```

## Pages

### Home
- Hero section with CTA
- Featured projects showcase
- Call-to-action section

### About
- Company information
- Services offered
- Why choose us

### Team
- Team member profiles
- Skills display
- Contact links (LinkedIn, portfolio)

### Portfolio
- Project showcase with filters
- Filter by domain (Web, ML, LLM, MCP)
- Project details and links

### Contact
- Contact form
- Service selection
- Lead capture

## Components

### Navigation
Global navigation bar with branding and menu

### Footer
Footer with links, contact info, and social media

## API Integration

The `src/services/api.js` provides centralized API client:

```javascript
import { teamAPI, projectsAPI, contactAPI } from './services/api';

// Get team members
const members = await teamAPI.getTeamMembers();

// Get projects by domain
const mlProjects = await projectsAPI.getProjects('ML');

// Submit contact form
await contactAPI.submitContact(formData);
```

## Styling

- **Responsive** - Mobile-first approach
- **Modern** - Current CSS techniques
- **Consistent** - Unified color scheme and spacing
- **Variables** - Easy theme customization

Main colors:
- Primary: #667eea (Purple)
- Secondary: #764ba2 (Dark Purple)
- Backgrounds: #f9fafb (Light gray)
- Text: #1f2937 (Dark gray)

## Development

### Add New Page

1. Create component in `src/pages/`
2. Add route in `App.jsx`:
   ```jsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add navigation link in `Navigation.jsx`
4. Add styles if needed

### Add New Component

1. Create in `src/components/`
2. Import and use in pages
3. Add CSS file for styles

### API Usage

```javascript
// Create API service call
const api = {
  fetch: async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) throw new Error('API Error');
    return response.json();
  }
};

// Use in component
const [data, setData] = useState([]);
useEffect(() => {
  api.fetch('/endpoint').then(setData);
}, []);
```

## Building for Production

```bash
npm run build
```

Outputs to `dist/` directory. Deploy this folder to:
- Vercel
- Netlify  
- AWS S3 + CloudFront
- Your own server

## Environment Variables

```env
VITE_API_URL=http://localhost:8000/api/v1
```

For production, set to your deployed backend URL.

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Lint code (if ESLint configured)
```

## Performance

- **Code Splitting** - Vite handles automatically
- **Image Optimization** - Use local images in public/
- **Lazy Loading** - React Router code splitting ready
- **Caching** - Static assets cached by browser

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Breakpoints

- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

## Common Tasks

### Change Colors

Edit `pages/pages.css` and `components/Navigation.css`:
```css
--primary-color: #667eea;
--secondary-color: #764ba2;
```

### Add New API Endpoint

In `src/services/api.js`:
```javascript
export const newAPI = {
  getData: () => apiRequest('/endpoint'),
  postData: (data) => apiRequest('/endpoint', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
```

### Update Navigation

Edit `src/components/Navigation.jsx` to add new links

## Troubleshooting

### Port 5173 Already in Use
```bash
npm run dev -- --port 5174
```

### API Connection Failed
- Check backend is running on `localhost:8000`
- Verify `VITE_API_URL` in `.env`
- Check browser console for errors

### Styling Not Applied
- Clear browser cache
- Restart dev server
- Check CSS file is imported

### Build Fails
```bash
rm -rf node_modules
npm install
npm run build
```

## Best Practices

1. **Use Components** - Keep components small and reusable
2. **Centralize API** - Use api.js for all requests
3. **Error Handling** - Always handle async errors
4. **Loading States** - Show loading indicators
5. **Validation** - Validate form inputs
6. **Accessibility** - Use semantic HTML, ARIA labels
7. **Performance** - Optimize images, lazy load
8. **Testing** - Test components and API calls

## Security

- Never store sensitive data in frontend
- Validate API responses
- Use HTTPS in production
- Implement authentication if needed
- Sanitize user input
- Use environment variables for API URL

## Future Enhancements

- Add authentication
- Search functionality
- Advanced filtering
- Comments/reviews
- Admin dashboard
- Dark mode
- Animations
- PWA support
- Multi-language support

---

For questions, see main README.md
