import { Eye, Pencil } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableErrorState,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeletonRow,
} from "@/shared/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

import { useInsurers } from "../../hooks/use-insurers";

export function InsurersListScreen() {
  const { data: insurers, isLoading, isError, refetch } = useInsurers();

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Seguradoras</h1>
        <Button asChild>
          <Link to="/admin/insurers/add">Nova seguradora</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, index) => <TableSkeletonRow key={index} cells={3} />)}

          {isError && !isLoading && (
            <TableErrorState
              colSpan={3}
              message="Não foi possível carregar as seguradoras."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && insurers?.length === 0 && (
            <TableEmptyState colSpan={3} message="Nenhuma seguradora cadastrada ainda." />
          )}

          {!isLoading &&
            !isError &&
            insurers?.map((insurer) => (
              <TableRow key={insurer.id}>
                <TableCell className="text-foreground">{insurer.name}</TableCell>
                <TableCell className="font-mono-data text-muted-foreground">
                  {insurer.cnpj ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link to={`/admin/insurers/${insurer.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link to={`/admin/insurers/${insurer.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Outlet />
    </div>
  );
}
