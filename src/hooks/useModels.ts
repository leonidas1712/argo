import { useQuery } from "@tanstack/react-query";
import { listModels } from "../service/commands";

export function useModels() {
    return useQuery({
        queryKey: ["listModels"],
        queryFn: listModels,
        staleTime: 60 * 1000 // only refetch once a minute - model list doesnt change so fast,
    });
}