
export interface Flower {
  name: string;
  imageUrl: string;
  symbolism: string;
}

export interface FlowerDrawing {
  id: string;
  dataUrl: string;
}

export interface BouquetState {
  drawings: string[];
  senderName: string;
  recipientName: string;
  message: string;
}

export type BuilderStep = 'DRAWING' | 'DETAILS' | 'CURATING' | 'FINAL';
