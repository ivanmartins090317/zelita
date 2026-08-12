/** Casa / lugar de sempre — onboarding cria sem coords; PWA confirma depois. */

export {
  hasConfirmedHomeCoords,
  hasHomeCoords,
  type HomePlaceCoords,
} from "./domain/home-coords";

export const LOCATION_CONSTANTS = {
  homePlaceName: "Casa",
  defaultHomeRadiusM: 150,
} as const;

export const locationModule = {
  id: "location",
} as const;
