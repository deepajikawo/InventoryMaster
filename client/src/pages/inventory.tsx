import { Sidebar } from "@/components/layout/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { type Product, type Inventory, type InsertInventory, insertInventorySchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

type TransactionForm = Omit<InsertInventory, "createdBy">;

export default function InventoryPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: products, isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const form = useForm<TransactionForm>({
    resolver: zodResolver(insertInventorySchema.omit({ createdBy: true })),
    defaultValues: {
      productId: 0,
      quantity: 0,
      type: "IN",
      description: "",
    },
  });

  const createTransaction = useMutation({
    mutationFn: async (data: TransactionForm) => {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({ title: "Transaction created successfully" });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create transaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (loadingProducts || loadingTransactions) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 space-y-8 overflow-y-auto">
        <h1 className="text-2xl font-semibold">Inventory Management</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-medium mb-4">New Transaction</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createTransaction.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IN">Stock In</SelectItem>
                          <SelectItem value="OUT">Stock Out</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createTransaction.isPending}
                >
                  {createTransaction.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Transaction"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Transaction History</h2>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {products?.find((p) => p.id === transaction.productId)?.name}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          {transaction.type === "IN" ? (
                            <ArrowUpCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-red-500" />
                          )}
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}