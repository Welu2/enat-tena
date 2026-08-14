"use client";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="am">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1815",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            background: "#ede7dc",
            borderRadius: 40,
            padding: "64px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: "#F8EEEE",
              color: "#963838",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 36,
            }}
          >
            ⚠
          </div>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#221f1b",
              margin: "0 0 8px",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#7e7569",
              margin: "0 0 8px",
            }}
          >
            A critical error occurred. Please try again.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: 10,
                color: "#7e7569",
                fontFamily: "monospace",
                marginBottom: 24,
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={retry}
            style={{
              minHeight: 48,
              padding: "12px 32px",
              borderRadius: 16,
              background: "#355e4c",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              marginTop: 16,
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
