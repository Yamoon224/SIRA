import { apiRequest } from "@/lib/api-client-http"

export const newsletterService = {
    subscribe: async (email: string, source = "footer") => {
        return apiRequest<{ message: string; alreadySubscribed: boolean }>({
            endpoint: "/newsletter/subscribe",
            method: "POST",
            data: { email, source },
        })
    },
}
