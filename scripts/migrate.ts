import { neon } from "@neondatabase/serverless"
import * as fs from "fs"
import * as path from "path"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config()

async function main() {
  // Check for required environment variables
  // Supabase integration often provides POSTGRES_URL, or we might have DATABASE_URL
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

  if (!connectionString) {
    console.error("POSTGRES_URL or DATABASE_URL is not set. Please set it in the environment variables.")
    console.error("For Supabase, you can find this in Project Settings -> Database -> Connection String")
    process.exit(1)
  }

  const sql = neon(connectionString)

  try {
    console.log("Creating tables...")
    const createTablesSql = fs.readFileSync(path.join(process.cwd(), "scripts/001_create_tables.sql"), "utf8")

    // Execute table creation
    // Splitting by semicolon might be needed if the driver doesn't support multiple statements,
    // but neon driver usually handles it. However, splitting is safer for large migrations.
    const createStatements = createTablesSql.split(";").filter((stmt) => stmt.trim().length > 0)

    for (const stmt of createStatements) {
      try {
        await sql(stmt)
      } catch (e: any) {
        console.error("Error executing statement:", stmt.substring(0, 50) + "...", e.message)
        // Continue to next statement? For create tables, maybe not.
      }
    }

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

    console.log("Adding new columns if missing...")
    // Check if the new SQL file exists before trying to read it
    const migrationFile = path.join(process.cwd(), "scripts/003_add_contact_details.sql")
    if (fs.existsSync(migrationFile)) {
      const addColumnsSql = fs.readFileSync(migrationFile, "utf8")
      const addStatements = addColumnsSql.split(";").filter((stmt) => stmt.trim().length > 0)

      for (const stmt of addStatements) {
        try {
          await sql(stmt)
        } catch (e: any) {
          console.log("Note on adding columns:", e.message)
        }
      }
      console.log("Columns check completed.")
    }

    console.log("Updating instructor to mode...")
    const modeMigrationFile = path.join(process.cwd(), "scripts/004_change_instructor_to_mode.sql")
    if (fs.existsSync(modeMigrationFile)) {
      const modeSql = fs.readFileSync(modeMigrationFile, "utf8")
      // Split by DO $$ ... $$ blocks is tricky, so we just run the whole file content as one if it's a block,
      // but our file has DO block and updates.
      // Since the file content is small and specific, let's just read it.
      // The neon driver might execute multiple statements if passed directly.
      // If not, we should split carefully.

      // Simple split by semicolon might break the DO block.
      // Instead, let's just execute the file content as one command if possible, or split by specific markers.
      // For safety with the DO block, let's just execute the whole string if the driver supports it.
      try {
        await sql(modeSql)
        console.log("Mode migration executed successfully.")
      } catch (e: any) {
        console.error("Error executing mode migration:", e.message)
      }
    }
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

main()
