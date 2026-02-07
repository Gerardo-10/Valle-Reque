"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faEnvelope,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
  faPaperPlane,
  faShieldAlt,
  faTimes,
  faKey,
} from "@fortawesome/free-solid-svg-icons"

interface VerificarEmailProps {
  email: string
  onEmailChange: (email: string) => void
  onEmailVerified?: (email: string, isVerified: boolean) => void
  nombres?: string
  apellidos?: string
  backendUrl?: string
  className?: string
  showLabel?: boolean
  placeholder?: string
  required?: boolean
}

export default function VerificarEmail({
  email,
  onEmailChange,
  onEmailVerified,
  nombres = "",
  apellidos = "",
  backendUrl = "http://localhost:5000",
  className = "",
  showLabel = true,
  placeholder = "ejemplo@gmail.com",
  required = false,
}: VerificarEmailProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Dominios permitidos
  const allowedDomains = ["gmail.com", "hotmail.com", "outlook.com"]

  // Verificar si el email tiene un dominio válido
  const isValidDomain = (email: string): boolean => {
    if (!email || !email.includes("@")) return false
    const domain = email.split("@")[1]?.toLowerCase().trim()
    return allowedDomains.includes(domain)
  }

  // Verificar si el email está completo y es válido
  const isEmailComplete = email && email.includes("@") && email.split("@")[1]
  const shouldShowVerifyButton = isEmailComplete && isValidDomain(email) && !isEmailSent && !isVerified

  // Countdown para reenvío
  useEffect(() => {
    let interval: number
    if (countdown > 0) {
      interval = window.setInterval(() => {
        setCountdown(countdown - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [countdown])

  // Enviar código de verificación
  const handleSendVerificationCode = async () => {
    if (!email || !isValidDomain(email)) {
      setError("Por favor ingresa un email válido de Gmail, Hotmail o Outlook")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${backendUrl}/api/send-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          nombres: nombres || "Usuario",
          apellidos: apellidos || "",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsEmailSent(true)
        setShowVerificationModal(true)
        setSuccess("Código de verificación enviado correctamente")
        setCountdown(60) // 60 segundos para reenvío
      } else {
        setError(data.message || "Error al enviar el código de verificación")
      }
    } catch {
      setError("Error de conexión con el servidor. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar código
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Por favor ingresa el código de 6 dígitos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${backendUrl}/api/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsVerified(true)
        setShowVerificationModal(false)
        setSuccess("¡Email verificado correctamente!")
        onEmailVerified?.(email, true)
      } else {
        setError(data.message || "Código de verificación incorrecto")
      }
    } catch {
      setError("Error de conexión con el servidor. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Reenviar código
  const handleResendCode = () => {
    if (countdown > 0) return

    setVerificationCode("")
    setError("")
    setSuccess("")
    handleSendVerificationCode()
  }

  // Cambiar email
  const handleChangeEmail = () => {
    setIsEmailSent(false)
    setShowVerificationModal(false)
    setVerificationCode("")
    setError("")
    setSuccess("")
    setIsVerified(false)
    onEmailVerified?.(email, false)
  }

  const getInputBorderClass = () => {
    if (isVerified) return "input-verified"
    if (email && email.includes("@") && !isValidDomain(email)) return "input-error"
    if (email && isValidDomain(email)) return "input-valid"
    return ""
  }

  return (
    <div className={`verificar-email-container ${className}`}>
      {/* Campo de email */}
      <div className="email-input-group">
        {showLabel && (
          <label className="email-label">
            Correo Electrónico{required && "*"}
          </label>
        )}

        <div className="email-input-wrapper">
          <input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => {
              onEmailChange(e.target.value)
              setError("")
              setSuccess("")
              // Reset estados cuando cambia el email
              if (isEmailSent) {
                setIsEmailSent(false)
                setVerificationCode("")
                setShowVerificationModal(false)
              }
            }}
            disabled={isVerified}
            required={required}
            className={`email-input ${getInputBorderClass()}`}
          />

          {/* Icono de estado */}
          <div className="email-status-icon">
            {isVerified ? (
              <FontAwesomeIcon icon={faCheckCircle} className="icon-verified" />
            ) : email && email.includes("@") && !isValidDomain(email) ? (
              <FontAwesomeIcon icon={faExclamationTriangle} className="icon-error" />
            ) : email && isValidDomain(email) ? (
              <FontAwesomeIcon icon={faShieldAlt} className="icon-valid" />
            ) : (
              <FontAwesomeIcon icon={faEnvelope} className="icon-default" />
            )}
          </div>
        </div>

        {/* Mensaje de validación de dominio */}
        {email && email.includes("@") && !isValidDomain(email) && (
          <p className="domain-error-message">
            <FontAwesomeIcon icon={faExclamationTriangle} className="message-icon" />
            Solo se permiten emails de Gmail, Hotmail o Outlook
          </p>
        )}
      </div>

      {/* Botón de verificar email - solo aparece con dominios válidos */}
      {shouldShowVerifyButton && (
        <button type="button" onClick={handleSendVerificationCode} disabled={isLoading} className="verify-email-btn">
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="btn-icon spinning" />
              Enviando código...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} className="btn-icon" />
              Verificar Email
            </>
          )}
        </button>
      )}

      {/* Estado verificado */}
      {isVerified && (
        <div className="verification-success">
          <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
          <span className="success-text">Email verificado correctamente</span>
        </div>
      )}

      {/* Estado del email no verificado */}
      {!isEmailSent && !isVerified && email && isValidDomain(email) && (
        <div className="verification-pending">
          <FontAwesomeIcon icon={faExclamationTriangle} className="pending-icon" />
          <span className="pending-text">Email no verificado. La verificación es obligatoria para continuar.</span>
        </div>
      )}

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} className="message-icon" />
          <span>{error}</span>
        </div>
      )}

      {success && !showVerificationModal && (
        <div className="success-message">
          <FontAwesomeIcon icon={faCheckCircle} className="message-icon" />
          <span>{success}</span>
        </div>
      )}

      {/* Modal de verificación de código */}
      {showVerificationModal && (
        <div className="verification-modal-overlay">
          <div className="verification-modal">
            <div className="modal-header">
              <h3>Ingresa el Código</h3>
              <button className="modal-close" onClick={() => setShowVerificationModal(false)} type="button">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-body">
              <div className="verification-steps">
                <div className="step completed">1</div>
                <div className="step-line"></div>
                <div className="step active">2</div>
              </div>

              <div className="email-sent-info">
                <FontAwesomeIcon icon={faEnvelope} className="info-icon" />
                <p>Hemos enviado un código de 6 dígitos a:</p>
                <strong className="email-address">{email}</strong>
              </div>

              <div className="code-input-group">
                <label className="code-label">
                  <FontAwesomeIcon icon={faKey} className="label-icon" />
                  Código de Verificación
                </label>
                <input
                  type="text"
                  placeholder="XXX - XXX"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setVerificationCode(value)
                    setError("")
                  }}
                  maxLength={6}
                  className="code-input"
                  autoFocus
                />
                <p className="code-info">Los guiones se agregan automáticamente</p>
              </div>

              {error && (
                <div className="modal-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
                  <span>{error}</span>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isLoading}
                  className="resend-btn"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="btn-icon" />
                  {countdown > 0 ? `Reenviar código (${countdown}s)` : "Reenviar código"}
                </button>

                {countdown > 0 && <p className="resend-info">Podrás reenviar en {countdown} segundos</p>}

                <div className="action-buttons">
                  <button type="button" onClick={handleChangeEmail} className="change-email-btn">
                    <FontAwesomeIcon icon={faEnvelope} className="btn-icon" />
                    Cambiar Email
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="verify-btn"
                  >
                    {isLoading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="btn-icon spinning" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="btn-icon" />
                        Verificar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información sobre dominios permitidos */}
      <div className="domains-info">
        <FontAwesomeIcon icon={faShieldAlt} className="info-icon" />
        Dominios permitidos: Gmail, Hotmail, Outlook
      </div>
    </div>
  )
}
