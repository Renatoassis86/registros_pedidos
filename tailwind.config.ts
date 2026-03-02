import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: "#F58220",
                    blue: "#003366",
                    teal: "#00A99D",
                },
                cv: {
                    primary: "#F58220",
                    secondary: "#003366",
                    accent: "#00A99D",
                    dark: "#1A1A1A",
                    light: "#F8F9FA",
                }
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            boxShadow: {
                "premium": "0 10px 30px -10px rgba(0, 51, 102, 0.15)",
            }
        },
    },
    plugins: [],
};
export default config;
