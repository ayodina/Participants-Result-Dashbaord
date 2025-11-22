import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { createTablesSql, seedDataSql } from "@/lib/db-schema"

export async function POST() {
  try {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

    if (!connectionString) {
      return NextResponse.json(
        { error: "Database connection string not found. Check your environment variables." },
        { status: 500 },
      )
    }

    const sql = neon(connectionString)

    console.log("Initializing database...")

    // Execute table creation
    // Splitting by semicolon to execute statements individually if needed
    // but sending as one block usually works better for transactions if supported
    // Here we split to be safe and consistent with the migration script logic
    const createStatements = createTablesSql.split(";").filter((stmt) => stmt.trim().length > 0)

    for (const stmt of createStatements) {
      await sql(stmt)
    }

    // Execute seeding
    const seedStatements = seedDataSql.split(";").filter((stmt) => stmt.trim().length > 0)

    for (const stmt of seedStatements) {
      try {
        await sql(stmt)
      } catch (e: any) {
        // Ignore "relation already exists" or "duplicate key" type errors for seeding
        // checking for code '23505' (unique_violation) or similar message
        if (!e.message?.includes("already exists") && !e.message?.includes("duplicate key")) {
          console.warn("Seeding warning:", e.message)
        }
      }
    }

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error: any) {
    console.error("Database initialization failed:", error)
    return NextResponse.json({ error: error.message || "Failed to initialize database" }, { status: 500 })
  }
}
