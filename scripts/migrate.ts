import { neon } from "@neondatabase/serverless"
import * as fs from "fs"
import * as path from "path"

async function main() {
  // Check for required environment variables
  if (!process.env.POSTGRES_URL) {
    console.error("POSTGRES_URL is not set. Please set it in the environment variables.")
    process.exit(1)
  }

  const sql = neon(process.env.POSTGRES_URL)

  try {
    console.log("Creating tables...")
    const createTablesSql = fs.readFileSync(path.join(process.cwd(), "scripts/001_create_tables.sql"), "utf8")
    await sql(createTablesSql)
    console.log("Tables created successfully")

    console.log("Seeding data...")
    const seedDataSql = fs.readFileSync(path.join(process.cwd(), "scripts/002_seed_data.sql"), "utf8")

    // Split seed statements and execute individually to handle potential errors better
    const seedStatements = seedDataSql.split(";").filter((stmt) => stmt.trim().length > 0)

    let successCount = 0
    let errorCount = 0

    for (const stmt of seedStatements) {
      try {
        await sql(stmt)
        successCount++
      } catch (e: any) {
        // Ignore "relation already exists" or "duplicate key" errors which are expected on re-runs
        if (!e.message?.includes("already exists") && !e.message?.includes("duplicate key")) {
          console.log("Note on seeding statement:", e.message)
          errorCount++
        }
      }
    }
    console.log(`Data seeded: ${successCount} statements executed successfully.`)
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

main()
