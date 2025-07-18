import { api } from "@/libs/api";
import type { Product } from "@/types/product";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// export function useCreateProduct() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (payload: { name: string; price: number; attr_num: string }) =>
//       api<Product>('/products', { method: 'POST', body: JSON.stringify(payload) }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
//   });
// }


export function useCreateProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn:(payload: {
      name:string;
      price: number;
      attr_num: string
    }) => api<Product>("api/products",{
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    }),

    onSuccess: () => qc.invalidateQueries({queryKey:['products']})
  })
}