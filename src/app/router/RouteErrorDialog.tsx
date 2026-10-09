import { useEffect, useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { isStaleChunkError, reloadOnceForStaleChunk } from "@/lib/recover-stale-chunk";

/**
 * Uncaught route-level errors (unexpected client crashes, unhandled
 * loader/action rejections) surface here. Kept as a dialog rather than a
 * full ErrorPage since it can fire mid-navigation without losing the
 * surrounding app chrome; for whole-page failures like 403/404 see
 * `components/feedback/ErrorPage`.
 */
export function RouteErrorDialog() {
  const navigate = useNavigate();
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? error.statusText || String(error.data || "Something went wrong. Please try again.")
    : error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  const staleChunkError = isStaleChunkError(error) || isStaleChunkError(message);

  useEffect(() => {
    if (staleChunkError) reloadOnceForStaleChunk();
  }, [staleChunkError]);

  if (staleChunkError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-sm text-muted-foreground">
        Refreshing the application…
      </div>
    );
  }

  return (
    <Dialog open>
      <DialogContent className="!max-w-lg bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <CircleAlert className="h-5 w-5 text-destructive" aria-hidden />
            </div>
            <DialogTitle>Something went wrong</DialogTitle>
          </div>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button onClick={() => navigate("/")}>Go home</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
