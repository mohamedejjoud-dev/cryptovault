import React from 'react';
import '../styles/ErrorMessage.css';

/**
 * Displays an error state with an optional retry action.
 * @param {string} message - The error message to display.
 * @param {Function} [onRetry] - Optional retry callback.
 */
const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-message" role="alert" aria-live="assertive">
    <span className="error-message__icon" aria-hidden="true">⚠</span>
    <p className="error-message__title">Unable to load data</p>
    {message && (
      <code className="error-message__body">{message}</code>
    )}
    {onRetry && (
      <button
        type="button"
        className="error-message__retry"
        onClick={onRetry}
      >
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage;
