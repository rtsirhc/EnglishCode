export default {
            theme: {
                extend: {
                    fontFamily: {
                        bubblegum: ['"Bubblegum Sans"', 'Georgia', 'serif'],
                        nunito: ['Nunito', 'sans-serif'],
                    },
                    colors: {
                        storybook: {
                            bg: '#FFF8F0',
                            page: '#FFFEF9',
                            spine: '#8B5E3C',
                            accent1: '#FF6B6B',
                            accent2: '#4ECDC4',
                            accent3: '#FFE66D',
                            accent4: '#A78BFA',
                            accent5: '#F472B6',
                            accent6: '#34D399',
                            accent7: '#60A5FA',
                            dark: '#2D3436',
                        }
                    },
                    keyframes: {
                        'bounce-in': {
                            '0%': { transform: 'scale(0)', opacity: '0' },
                            '50%': { transform: 'scale(1.15)' },
                            '100%': { transform: 'scale(1)', opacity: '1' },
                        },
                        'wiggle': {
                            '0%, 100%': { transform: 'rotate(-3deg)' },
                            '50%': { transform: 'rotate(3deg)' },
                        },
                        'float': {
                            '0%, 100%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' },
                        },
                        'sparkle': {
                            '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                            '50%': { opacity: '0.5', transform: 'scale(1.2)' },
                        },
                        'slide-up': {
                            '0%': { transform: 'translateY(40px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                        'whoosh': {
                            '0%': { transform: 'scale(1) rotate(0deg)' },
                            '25%': { transform: 'scale(0.9) rotate(-5deg)' },
                            '50%': { transform: 'scale(1.1) rotate(5deg)' },
                            '75%': { transform: 'scale(0.95) rotate(-3deg)' },
                            '100%': { transform: 'scale(1) rotate(0deg)' },
                        }
                    },
                    animation: {
                        'bounce-in': 'bounce-in 0.5s ease-out',
                        'wiggle': 'wiggle 1s ease-in-out infinite',
                        'float': 'float 3s ease-in-out infinite',
                        'sparkle': 'sparkle 1.5s ease-in-out infinite',
                        'slide-up': 'slide-up 0.6s ease-out',
                        'whoosh': 'whoosh 0.8s ease-in-out',
                    }
                }
            }
        };
