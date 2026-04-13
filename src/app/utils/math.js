export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const rand = (min, max) => Math.random() * (max - min) + min;