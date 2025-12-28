import "hono";

declare module "hono" {
	interface Context {
		user?: {
			id: string;
			email: string;
		};
		workspace?: {
			id: string;
			name: string;
			role: "admin" | "member";
		};
	}
}
