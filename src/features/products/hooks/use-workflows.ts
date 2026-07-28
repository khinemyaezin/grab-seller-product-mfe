import { useQuery } from "@tanstack/react-query";
import type { HateoasLink } from "@khinemyaezin/seller-api";
import { fetchWorkflowsRoot } from "../api/workflows-discovery";
import type { WorkflowsRoot } from "@/features/products/types";

export function useWorkflowsRoot(workflowsLink: HateoasLink | null | undefined) {
  return useQuery<WorkflowsRoot>({
    queryKey: ["workflows-root", workflowsLink?.href],
    queryFn: () => fetchWorkflowsRoot(workflowsLink!),
    enabled: !!workflowsLink,
    staleTime: Infinity,
  });
}

export function useCreateSellableProductLink(
  workflowsLink: HateoasLink | null | undefined,
) {
  return useWorkflowsRoot(workflowsLink).data?.createSellableProduct;
}
