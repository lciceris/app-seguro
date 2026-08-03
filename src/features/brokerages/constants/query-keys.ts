export const brokerageKeys = {
  all: ["brokerages"] as const,
  lists: () => [...brokerageKeys.all, "list"] as const,
  details: () => [...brokerageKeys.all, "detail"] as const,
  detail: (id: string) => [...brokerageKeys.details(), id] as const,
  own: () => [...brokerageKeys.all, "own"] as const,
};
