import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { usersTable } from "@/src/schema";

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Database not configured. Please set DATABASE_URL environment variable.",
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    // Test database connection by running a simple query
    const result = await db.select().from(usersTable).limit(1);

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
      result: result,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Database not configured. Please set DATABASE_URL environment variable.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and email are required",
        },
        { status: 400 },
      );
    }

    // Insert a test user
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name,
        email,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error: unknown) {
    console.error("User creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
