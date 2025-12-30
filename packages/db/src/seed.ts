// packages/db/src/seed.ts
import { hashPassword } from "@shared/crypto/password";
import { eq } from "drizzle-orm";
import { db, users, workspaceMembers, workspaces } from "./index";

async function seed() {
	// ---- User ----
	let user = db
		.select()
		.from(users)
		.where(eq(users.email, "admin@example.com"))
		.get();

	if (!user) {
		const passwordHash = await hashPassword("password123");

		db.insert(users)
			.values({
				email: "admin@example.com",
				passwordHash,
			})
			.run();

		user = db
			.select()
			.from(users)
			.where(eq(users.email, "admin@example.com"))
			.get();
	}

	if (!user) {
		throw new Error("Failed to seed admin user");
	}

	// ---- Workspace ----
	let workspace = db
		.select()
		.from(workspaces)
		.where(eq(workspaces.name, "Demo Workspace"))
		.get();

	if (!workspace) {
		db.insert(workspaces)
			.values({
				name: "Demo Workspace",
				ownerId: user.id,
			})
			.run();

		workspace = db
			.select()
			.from(workspaces)
			.where(eq(workspaces.name, "Demo Workspace"))
			.get();
	}

	if (!workspace) {
		throw new Error("Failed to seed workspace");
	}

	// ---- Membership ----
	const membership = db
		.select()
		.from(workspaceMembers)
		.where(eq(workspaceMembers.userId, user.id))
		.get();

	if (!membership) {
		db.insert(workspaceMembers)
			.values({
				userId: user.id,
				workspaceId: workspace.id,
				role: "admin",
			})
			.run();
	}

	// ---- Debug Output ----
	console.log("Seed complete");
	console.log("Seeded User:", user);
	console.log("Seeded Workspace:", workspace);
	console.log("Seeded Membership:", membership);
}

seed();
