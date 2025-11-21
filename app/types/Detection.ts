export type Detection = {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}; 