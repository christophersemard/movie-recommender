/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#121212", // Couleur de fond noire (sombre)
                textPrimary: "#ffffff", // Texte en blanc
                accentYellow: "#FFB84D", // Jaune orangé pour les accents
                accentDark: "#333333", // Gris foncé pour les éléments sombres
            },
            fontFamily: {
                sans: ["Inter", "Arial", "sans-serif"], // Police moderne et lisible
            },
        },
    },
    plugins: [],
};

export default config;
