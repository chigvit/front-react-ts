// import { z } from "zod";

// export const registrationData = z.object({
//     email: z.string().email(),
//     password: z.string().min(6),
//     confirm_password: z.string(),
// }).refine((data) => data.password === data.confirm_password, {
//     message: "Passwords do not match",
//     path: ["confirm_password"],
// });