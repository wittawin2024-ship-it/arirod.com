import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();

    // Check if user is authenticated as admin or editor
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "product-images";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate bucket name
    if (!["brand-logos", "product-images", "blog-images"].includes(bucket)) {
      return NextResponse.json({ error: "Invalid bucket name" }, { status: 400 });
    }

    // 1. Check and automatically initialize bucket if not exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) {
      console.warn("Could not list buckets:", listError.message);
    }

    const bucketExists = buckets?.some((b) => b.id === bucket);

    if (!bucketExists) {
      console.log(`Bucket "${bucket}" not found. Initializing public bucket...`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(
        bucket,
        {
          public: true,
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        }
      );

      if (createError) {
        console.error("Failed to initialize bucket:", createError.message);
        return NextResponse.json(
          { error: `Storage bucket failed to initialize: ${createError.message}` },
          { status: 500 }
        );
      }
    }

    // 2. Format name and convert file to buffer
    const fileExt = file.name.split(".").pop();
    const randomId = Math.random().toString(36).substring(2, 11);
    const fileName = `${Date.now()}-${randomId}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload file using admin client (bypasses storage RLS)
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 4. Generate public URL
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
    });
  } catch (err: any) {
    console.error("Image Upload API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload file to storage" },
      { status: 500 }
    );
  }
}
