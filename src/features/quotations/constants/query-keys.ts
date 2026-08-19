export const quotationKeys = {
  all: ["quotations"] as const,
  lists: () => [...quotationKeys.all, "list"] as const,
  details: () => [...quotationKeys.all, "detail"] as const,
  detail: (id: string) => [...quotationKeys.details(), id] as const,
  vehicles: (quotationId: string) => [...quotationKeys.detail(quotationId), "vehicles"] as const,
  qar: (quotationId: string) => [...quotationKeys.detail(quotationId), "qar"] as const,
  qarAttachments: (quotationId: string) =>
    [...quotationKeys.detail(quotationId), "qar-attachments"] as const,
  insurers: (quotationId: string) => [...quotationKeys.detail(quotationId), "insurers"] as const,
};

export const quotationInsurerEventKeys = {
  all: ["quotation-insurer-events"] as const,
  list: (quotationInsurerId: string) =>
    [...quotationInsurerEventKeys.all, quotationInsurerId] as const,
};
