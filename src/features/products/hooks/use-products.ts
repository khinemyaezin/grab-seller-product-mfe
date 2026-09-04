import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogService } from "@/features/products/api";
import type { HateoasLink } from "@khinemyaezin/seller-api";
import type {
  CreateProductRequest,
  CreateSellableProductRequest,
  CreateSellableProductResponse,
  GetFullProductResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  UpdateSellableProductRequest,
  UpdateSellableProductResponse,
  ProductModerationResponse,
  DeleteProductResponse,
  ProductFilterFormValue,
} from "@/features/products/types";
import { resolveUrlTemplate } from "@khinemyaezin/seller-api";
import { ProductSearchRequest } from "../types/catalog.request";
import { ProductSearchResponse } from "../types/catalog.response";

export function useProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { link: HateoasLink; request: CreateProductRequest }>({
    mutationFn: ({ link, request }) => catalogService.createProduct(link, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateSellableProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    CreateSellableProductResponse,
    Error,
    { link: HateoasLink; request: CreateSellableProductRequest }
  >({
    mutationFn: ({ link, request }) => catalogService.createSellableProduct(link, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateSellableProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateSellableProductResponse,
    Error,
    { link: HateoasLink; request: UpdateSellableProductRequest }
  >({
    mutationFn: ({ link, request }) => catalogService.updateSellableProduct(link, request),
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (resp.productId) {
        queryClient.invalidateQueries({ queryKey: ["product", resp.productId] });
      }
    },
  });
}

export function useProductUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation<UpdateProductResponse, Error, { link: HateoasLink; request: UpdateProductRequest }>({
    mutationFn: ({ link, request }) => catalogService.updateProduct(link, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useProductDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation<DeleteProductResponse, Error, { link: HateoasLink }>({
    mutationFn: ({ link }) => catalogService.deleteProduct(link),
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", resp.productId] });
    },
  });
}

export function useProductRestoreMutation() {
  const queryClient = useQueryClient();
  return useMutation<ProductModerationResponse, Error, { link: HateoasLink }>({
    mutationFn: ({ link }) => catalogService.restoreProduct(link),
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", resp.productId] });
    },
  });
}

export function useProductSearch(productsLink: HateoasLink, filters: ProductFilterFormValue) {
  const request: ProductSearchRequest = {
    ...filters,
    productStatus: filters.productStatus || undefined,
  };
  return useQuery<ProductSearchResponse>({
    queryKey: ["products", "search", productsLink?.href, filters],
    queryFn: async () => catalogService.searchProducts(productsLink!, request),
    enabled: !!productsLink,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductGet(productLink: HateoasLink | undefined, productId: string) {
  const extendedLink = productLink && resolveUrlTemplate({ productId }, productLink);
  return useQuery<GetFullProductResponse, Error>({
    queryKey: ["product", productId],
    queryFn: async () => catalogService.getFullProduct(extendedLink!),
    enabled: !!productLink,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductPublishMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProductModerationResponse, Error, { link: HateoasLink }>({
    mutationFn: ({ link }) => catalogService.publishProduct(link),
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", resp.productId] });
    },
  });
}
