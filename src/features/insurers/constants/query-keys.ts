export const insurerKeys = {
  all: ["insurers"] as const,
  lists: () => [...insurerKeys.all, "list"] as const,
  details: () => [...insurerKeys.all, "detail"] as const,
  detail: (id: string) => [...insurerKeys.details(), id] as const,
  catalog: () => [...insurerKeys.all, "catalog"] as const,
};
