import { notifications } from "@mantine/notifications";

// interface to match error from Tauri
export interface ArgoError {
    kind: 'chatError';  // Add more error kinds as they're added to Rust
    message: string;
}

// Type guard to check if the error matches ArgoError shape
export const isArgoError = (err: unknown): err is ArgoError => {
    return (
      typeof err === 'object' &&
      err !== null &&
      'kind' in err &&
      'message' in err &&
      typeof (err as ArgoError).message === 'string'
    );
};

// Show error notification based on ArgoError (known from Tauri) or other error
export function showErrorNotification(err: unknown) {
    const autoClose = 5000;
    if (isArgoError(err)) {
        notifications.show({
          title: "Error",
          message: err.message,
          color: "red",
          autoClose,
        });
      } else {
        notifications.show({
          title: "Unexpected error",
          message: `An unexpected error occured: ${JSON.stringify(err)}`,
          color: "red",
          autoClose,
        });
      }
}