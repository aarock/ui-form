export class PickAbortedError extends Error {
    name = "PickAborted"
    message = "The user canceled file selection"
}

export class PresignError extends Error {
    name = "PresignError"
    message = "The upload target could not be presigned"
}

export class PresignAccessError extends Error {
    name = "PresignAccessError"
    message = "Unexpected presigned response format"
}

export class UploadError extends Error {
    name = "UploadError"
    message = "The upload could not be sent"
}

export class UploadAbortedError extends Error {
    name = "UploadAborted"
    message = "The upload was aborted"
}

export class UploadAbortFailedError extends Error {
    name = "UploadAbortFailed"
    message = "The upload failed and was unable to abort cleanly"
}

export class UploadIncompleteError extends Error {
    name = "UploadIncompleteError"
    message = "The upload is not yet complete"
}
