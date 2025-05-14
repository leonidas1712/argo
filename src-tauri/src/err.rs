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
}

/// e.g { kind: chatError, message: "..." }
#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
enum ArgoErrorKind {
    ChatError(String),
}

impl serde::Serialize for ArgoError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let err_msg = self.to_string();
        let err_kind = match self {
            Self::ChatError(_) => ArgoErrorKind::ChatError(err_msg),
        };

        err_kind.serialize(serializer)
    }
}
