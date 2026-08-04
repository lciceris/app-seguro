export const brokerageKeys = {
  all: ["brokerages"] as const,
  lists: () => [...brokerageKeys.all, "list"] as const,
  details: () => [...brokerageKeys.all, "detail"] as const,
  detail: (id: string) => [...brokerageKeys.details(), id] as const,
  own: () => [...brokerageKeys.all, "own"] as const,
};

// plans ainda não tem spec própria — query key mínima só pro Select de
// edit-brokerage-drawer (ver api/list-plans).
export const planKeys = {
  all: ["plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
};
