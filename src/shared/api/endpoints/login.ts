import { POST } from "../client";

export function login({ email, password }: { email: string, password: string }) {
    return POST("/login", { email, password });
}