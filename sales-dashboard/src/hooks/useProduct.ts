import { api } from "@/lib/fetcher";
import type { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";


export function useProduct(){
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api<Product[]>('/products'),
  });
}