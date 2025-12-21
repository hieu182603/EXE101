export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  brand: string;
  specs: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
}