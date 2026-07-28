import { api, resolveLink, type HalLinks, type HateoasLink } from "@khinemyaezin/seller-api";
import type { WorkflowsRoot } from "../types";

type RootResponse = { _links: HalLinks };

export async function fetchWorkflowsRoot(link: HateoasLink): Promise<WorkflowsRoot> {
  const response = await api.followLink<RootResponse>(link);
  return {
    self: resolveLink(response._links, "self"),
    createSellableProduct: resolveLink(response._links, "create-sellable-product"),
    getCreateSellableProduct: resolveLink(response._links, "get-create-sellable-product"),
  };
}
