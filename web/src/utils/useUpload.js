import * as React from "react";

const ANYTHING_UPLOAD_API = "https://api.createanything.com/v0/upload";

async function uploadViaAnythingApiForFile(file) {
  const ab = await file.arrayBuffer();
  const res = await fetch(ANYTHING_UPLOAD_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(ab),
  });

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error("Upload failed: File too large.");
    }
    throw new Error(`Upload failed: [${res.status}] ${res.statusText}`);
  }

  const data = await res.json().catch(() => ({}));
  if (!data?.url) {
    throw new Error("Upload failed: invalid response");
  }

  return { url: data.url, mimeType: data.mimeType || null };
}

async function uploadViaAnythingApiJson(payload) {
  const res = await fetch(ANYTHING_UPLOAD_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error("Upload failed: File too large.");
    }
    throw new Error(`Upload failed: [${res.status}] ${res.statusText}`);
  }

  const data = await res.json().catch(() => ({}));
  if (!data?.url) {
    throw new Error("Upload failed: invalid response");
  }

  return { url: data.url, mimeType: data.mimeType || null };
}

async function tryClubSoftPresignedUpload({ file, folder }) {
  const filename =
    typeof file?.name === "string" && file.name ? file.name : "upload";
  const contentType =
    typeof file?.type === "string" && file.type
      ? file.type
      : "application/octet-stream";

  const presignRes = await fetch("/api/clubsoft/s3/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder:
        typeof folder === "string" && folder.trim()
          ? folder.trim()
          : "club-configuration",
      filename,
      contentType,
      expiresSeconds: 900,
    }),
  });

  if (!presignRes.ok) {
    const errData = await presignRes.json().catch(() => ({}));
    const msg =
      errData?.error ||
      `When fetching /api/clubsoft/s3/presign, the response was [${presignRes.status}] ${presignRes.statusText}`;
    throw new Error(msg);
  }

  const presign = await presignRes.json();
  const uploadUrl = presign?.uploadUrl;
  const publicUrl = presign?.publicUrl;

  if (!uploadUrl || !publicUrl) {
    throw new Error("Invalid presign response from ClubSoft");
  }

  const putHeaders = {};
  // Only send Content-Type when we have one; some presigns may be strict.
  if (contentType && contentType !== "application/octet-stream") {
    putHeaders["Content-Type"] = contentType;
  }

  let putRes;
  try {
    putRes = await fetch(uploadUrl, {
      method: presign?.method || "PUT",
      headers: putHeaders,
      body: file,
    });
  } catch (e) {
    // This is usually CORS or a network failure.
    throw new Error(
      "S3 upload failed (network/CORS). Check S3 bucket CORS allows https://clubsoft.site and https://www.clubsoft.site",
    );
  }

  if (!putRes.ok) {
    throw new Error(
      `S3 upload failed: [${putRes.status}] ${putRes.statusText}`,
    );
  }

  return {
    url: publicUrl,
    mimeType: contentType,
    source: "clubsoft_s3",
    object_key: typeof presign?.key === "string" ? presign.key : null,
    folder:
      typeof presign?.folder === "string" && presign.folder.trim()
        ? presign.folder.trim()
        : typeof folder === "string" && folder.trim()
          ? folder.trim()
          : null,
  };
}

function buildRequireS3ErrorMessage(err) {
  const base =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "S3 upload failed";

  // Keep this message practical — it’s the stuff that actually breaks uploads.
  const hint =
    "S3 is required for this upload. Common causes: (1) S3 bucket CORS missing https://clubsoft.site (and https://www.clubsoft.site), (2) ClubSoft rejected the presign request (JWT/AUTH_SECRET mismatch or missing scope).";

  return `${base}. ${hint}`;
}

async function registerMediaFromUpload(uploadResult, file) {
  try {
    if (!uploadResult?.url) {
      return;
    }

    const payload = {
      url: uploadResult.url,
      mime_type:
        typeof uploadResult?.mimeType === "string"
          ? uploadResult.mimeType
          : null,
      folder:
        typeof uploadResult?.folder === "string" ? uploadResult.folder : null,
      object_key:
        typeof uploadResult?.object_key === "string"
          ? uploadResult.object_key
          : null,
      source:
        typeof uploadResult?.source === "string"
          ? uploadResult.source
          : "unknown",
      original_filename:
        typeof file?.name === "string" && file.name ? file.name : null,
      size_bytes: typeof file?.size === "number" ? file.size : null,
    };

    const res = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Non-fatal: media library should never break uploads.
    if (!res.ok) {
      return;
    }
  } catch (e) {
    // Non-fatal
  }
}

function useUpload() {
  const [loading, setLoading] = React.useState(false);
  const upload = React.useCallback(async (input) => {
    try {
      setLoading(true);

      const requireS3 = !!input?.requireS3;

      // Prefer ClubSoft S3 presigned uploads for file uploads when possible.
      if ("file" in input && input.file) {
        try {
          const s3Result = await tryClubSoftPresignedUpload({
            file: input.file,
            folder: input.folder,
          });

          await registerMediaFromUpload(s3Result, input.file);
          return s3Result;
        } catch (e) {
          console.error("ClubSoft S3 upload failed", e);

          if (requireS3) {
            throw new Error(buildRequireS3ErrorMessage(e));
          }
          // Non-fatal: fall back to Anything uploads when not enforcing S3.
        }
      }

      if (input?.requireS3) {
        // The caller explicitly required S3, but we didn't do an S3 upload.
        // (Usually: caller passed url/base64/buffer, or file upload wasn't present.)
        throw new Error(
          "S3 is required for this upload, but no file was provided.",
        );
      }

      // Fallback: Anything upload.
      // NOTE: In Anything's editor environment we can use /_create/api/upload/.
      // In published deployments, that route may not exist. So we try it first,
      // then fall back to calling the Anything upload API directly.
      let result;

      if ("file" in input && input.file) {
        // 1) Try local /_create endpoint (fast path in dev/create)
        try {
          const formData = new FormData();
          formData.append("file", input.file);
          const response = await fetch("/_create/api/upload/", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            // If /_create isn't available in this environment, fall back.
            if (response.status !== 404) {
              if (response.status === 413) {
                throw new Error("Upload failed: File too large.");
              }
              throw new Error("Upload failed");
            }
            throw new Error("_create_upload_unavailable");
          }

          const data = await response.json();
          result = { url: data.url, mimeType: data.mimeType || null };
        } catch (e) {
          // 2) Use Anything upload API directly (works in published deployments)
          result = await uploadViaAnythingApiForFile(input.file);
        }
      } else if ("url" in input) {
        // Try /_create first; if missing, hit upload API directly.
        try {
          const response = await fetch("/_create/api/upload/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: input.url }),
          });
          if (!response.ok) {
            if (response.status !== 404) {
              if (response.status === 413) {
                throw new Error("Upload failed: File too large.");
              }
              throw new Error("Upload failed");
            }
            throw new Error("_create_upload_unavailable");
          }
          const data = await response.json();
          result = { url: data.url, mimeType: data.mimeType || null };
        } catch {
          result = await uploadViaAnythingApiJson({ url: input.url });
        }
      } else if ("base64" in input) {
        try {
          const response = await fetch("/_create/api/upload/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ base64: input.base64 }),
          });
          if (!response.ok) {
            if (response.status !== 404) {
              if (response.status === 413) {
                throw new Error("Upload failed: File too large.");
              }
              throw new Error("Upload failed");
            }
            throw new Error("_create_upload_unavailable");
          }
          const data = await response.json();
          result = { url: data.url, mimeType: data.mimeType || null };
        } catch {
          result = await uploadViaAnythingApiJson({ base64: input.base64 });
        }
      } else {
        // buffer upload (rare on web)
        try {
          const response = await fetch("/_create/api/upload/", {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: input.buffer,
          });
          if (!response.ok) {
            if (response.status !== 404) {
              if (response.status === 413) {
                throw new Error("Upload failed: File too large.");
              }
              throw new Error("Upload failed");
            }
            throw new Error("_create_upload_unavailable");
          }
          const data = await response.json();
          result = { url: data.url, mimeType: data.mimeType || null };
        } catch {
          // Buffer path: call API directly as octet-stream
          const res = await fetch(ANYTHING_UPLOAD_API, {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: input.buffer,
          });
          if (!res.ok) {
            if (res.status === 413) {
              throw new Error("Upload failed: File too large.");
            }
            throw new Error(`Upload failed: [${res.status}] ${res.statusText}`);
          }
          const data = await res.json().catch(() => ({}));
          result = { url: data.url, mimeType: data.mimeType || null };
        }
      }

      const finalResult = {
        url: result.url,
        mimeType: result.mimeType || null,
        source: "anything_upload",
        folder:
          typeof input?.folder === "string" && input.folder.trim()
            ? input.folder.trim()
            : null,
        object_key: null,
      };

      if ("file" in input && input.file) {
        await registerMediaFromUpload(finalResult, input.file);
      }

      return finalResult;
    } catch (uploadError) {
      if (uploadError instanceof Error) {
        return { error: uploadError.message };
      }
      if (typeof uploadError === "string") {
        return { error: uploadError };
      }
      return { error: "Upload failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  return [upload, { loading }];
}

export { useUpload };
export default useUpload;
