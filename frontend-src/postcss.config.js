/**
 * PostCSS — required so Vite processes @tailwind in CSS through Tailwind v3.
 * Without this, className utilities never get generated (page looks unstyled).
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
