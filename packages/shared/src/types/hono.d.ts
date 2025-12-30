// packages/shared/src/types/hono.d.ts
import "hono";

declare module "hono" {
	interface Context {
		user?: {
			id: number;
			email: string;
		};
		workspace?: {
			id: string;
			name: string;
			role: "admin" | "member";
		};
	}
}
