/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './blog/**/*.html',
    './black-male-romance-author/**/*.html',
    './chapter-one/**/*.html',
    './scripts/**/*.js',
  ],
  // drafts/ is excluded on purpose. Those files stay out of the build.
  safelist: [
    'shadow-lg',
    'overflow-hidden',
    'p-6',
    'transition',
    'duration-300',
    'transform',
    'hover:shadow-xl',
    'hover:-translate-y-1',
    'text-xl',
    'font-semibold',
    'mb-3',
    'mb-4',
    'font-medium',
  ],
};
