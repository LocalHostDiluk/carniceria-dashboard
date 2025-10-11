// src/components/dashboard/TableSkeleton.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const TableSkeleton = () => {
  const skeletonRows = Array(8).fill(0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton className="h-5 w-[150px]" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-5 w-[100px]" />
          </TableHead>
          <TableHead className="text-right">
            <Skeleton className="h-5 w-[80px] ml-auto" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-5 w-[80px]" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {skeletonRows.map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-5 w-[200px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-[120px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-[80px] ml-auto" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-[80px]" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
