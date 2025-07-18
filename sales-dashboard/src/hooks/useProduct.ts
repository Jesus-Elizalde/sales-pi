import { api } from "@/libs/api";
import type { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";


export function useProduct() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api<Product[]>('/api/products'),
    staleTime: 60_000 // 1-minute fresh window
  });
}
