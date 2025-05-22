// Automatically when doing ? on Result<T, OllamaError> and fn returns ArgoError
// To convert OllamaError -> ArgoError::ChatError
impl From<ollama_rs::error::OllamaError> for ArgoError {
    fn from(value: ollama_rs::error::OllamaError) -> Self {
        ArgoError::ChatError(value.to_string())
    }
}

// To handle error from tauri when sending from channel
impl From<tauri::Error> for ArgoError {
    fn from(value: tauri::Error) -> Self {
        ArgoError::ChatError(value.to_string())
    }
}

/// Error type to use in tauri commands
#[derive(Debug, thiserror::Error)]
pub enum ArgoError {
    #[error("Chat error: {0}")]
    ChatError(String),
    // Use #[from] for automatic conversion from sqlx error to DB error with msg
    #[error("Database error: {0}")]
    DatabaseError(#[from] sqlx::Error),
}

/// e.g { kind: chatError, message: "..." }
#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
enum ArgoErrorKind {
    ChatError(String),
    DatabaseError(String),
}

impl serde::Serialize for ArgoError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let err_msg = self.to_string();
        let err_kind = match self {
            Self::ChatError(_) => ArgoErrorKind::ChatError(err_msg),
            Self::DatabaseError(_) => ArgoErrorKind::DatabaseError(err_msg),
        };

        err_kind.serialize(serializer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use ollama_rs::error::OllamaError;
    use sqlx::Error as SqlxError;

    #[test]
    fn test_argo_error_from_ollama_error() {
        let ollama_error = OllamaError::Other("test error".to_string());
        let argo_error: ArgoError = ollama_error.into();

        match argo_error {
            ArgoError::ChatError(msg) => assert!(msg.contains("test error")),
            _ => panic!("Expected ChatError variant"),
        }
    }

    #[test]
    fn test_argo_error_from_sqlx_error() {
        let sqlx_error = SqlxError::PoolClosed;
        let argo_error: ArgoError = sqlx_error.into();

        match argo_error {
            ArgoError::DatabaseError(_) => (),
            _ => panic!("Expected DatabaseError variant"),
        }
    }

    #[test]
    fn test_argo_error_serialization() {
        let error = ArgoError::ChatError("test error".to_string());
        let serialized = serde_json::to_string(&error).unwrap();
        assert!(serialized.contains("chatError"));
        assert!(serialized.contains("test error"));
    }
}
