// Default card art URLs. Replace these with your own approved, license-checked
// Google Images source URLs if you want specific card art.
// The game will still work if an image fails to load because every card has a CSS fallback.

const BASE_SET_IDS = [
  4, 12, 33, 36, 46, 59, 76, 93, 95, 98, 20, 22, 30,
  2, 6, 13, 31, 34, 35, 39, 42, 44, 56, 63, 67, 102,
  7, 8, 11, 15, 19, 23, 25, 27, 28, 38, 40, 45, 57,
  3, 5, 9, 10, 14, 16, 17, 18, 21, 24, 29, 32, 41
];

export function getDefaultCardImageUrl(index) {
  const id = BASE_SET_IDS[index % BASE_SET_IDS.length];
  return `https://images.pokemontcg.io/base1/${id}.png`;
}

export const CARD_IMAGE_OVERRIDES = {
  // Example:
  // "fire-A": "https://your-approved-image-source.example/fire-energy.png"
};
