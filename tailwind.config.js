/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7f6',
          100: '#d6ece9',
          400: '#3f9c93',
          500: '#1f7a71',
          600: '#16645d',
          700: '#114f49',
          900: '#0a302c'
        },
        ink: '#1c2624',
        sand: '#f6f4ef'
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'Tahoma', 'sans-serif']
      }
    }
  },
  plugins: []
};
