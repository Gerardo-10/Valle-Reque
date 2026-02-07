"use client"

import type React from "react"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faEnvelope,
  faLock,
  faShieldAlt,
  faSpinner,
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
  faArrowLeft,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons"
import "../styles/recuperarcontraseña.css"

interface RecuperarContraseñaProps {
  isOpen: boolean
  onClose: () => void
  backendUrl?: string
}

type Step = "email" | "code" | "password" | "success"

const RecuperarContraseña: React.FC<RecuperarContraseñaProps> = ({
  isOpen,
  onClose,
  backendUrl = "http://localhost:5000",
}) => {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Dominios permitidos
  const allowedDomains = ["gmail.com", "hotmail.com", "outlook.com"]

  const isValidDomain = (email: string): boolean => {
    if (!email || !email.includes("@")) return false
    const domain = email.split("@")[1]?.toLowerCase().trim()
    return allowedDomains.includes(domain)
  }

  // Validación de contraseña robusta
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasUpperCase,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasSpecialChar,
    }
  }

  const resetModal = () => {
    setStep("email")
    setEmail("")
    setCode("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
    setResendTimer(0)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  // Enviar código de recuperación REAL
  const handleSendRecoveryCode = async () => {
    if (!email || !isValidDomain(email)) {
      setError("Por favor ingresa un email válido de Gmail, Hotmail o Outlook")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${backendUrl}/api/send-recovery-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep("code")
        setSuccess("Código de recuperación enviado. Revisa tu bandeja de entrada.")
        startResendTimer()
      } else {
        setError(data.message || "Error al enviar el código de recuperación")
      }
    } catch {
      setError("Error de conexión con el servidor. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar código REAL
  const handleVerifyCode = async () => {
    if (!code || code.length < 9) {
      setError("Por favor ingresa el código completo en formato XXX-XXX-XXX")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${backendUrl}/api/verify-recovery-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep("password")
        setSuccess("Código verificado correctamente. Ahora puedes cambiar tu contraseña.")
      } else {
        setError(data.message || "Código de verificación incorrecto")
      }
    } catch {
      setError("Error de conexión con el servidor. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Cambiar contraseña REAL
  const handleChangePassword = async () => {
    const passwordValidation = validatePassword(newPassword)

    if (!passwordValidation.isValid) {
      setError("La contraseña no cumple con los requisitos de seguridad")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${backendUrl}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep("success")
        setSuccess("Contraseña cambiada exitosamente")
      } else {
        setError(data.message || "Error al cambiar la contraseña")
      }
    } catch {
      setError("Error de conexión con el servidor. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Reenviar código
  const handleResendCode = () => {
    setCode("")
    setError("")
    setSuccess("")
    handleSendRecoveryCode()
  }

  // Timer para reenvío
  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Formatear código mientras se escribe
  const handleCodeChange = (value: string) => {
    // Remover todo excepto números
    const numbers = value.replace(/\D/g, "")

    // Limitar a 9 dígitos
    const limitedNumbers = numbers.slice(0, 9)

    // Formatear como XXX-XXX-XXX
    let formatted = ""
    for (let i = 0; i < limitedNumbers.length; i++) {
      if (i === 3 || i === 6) {
        formatted += "-"
      }
      formatted += limitedNumbers[i]
    }

    setCode(formatted)
    setError("")
  }

  if (!isOpen) return null

  const passwordValidation = validatePassword(newPassword)

  return (
    <div className="recovery-modal-overlay" onClick={handleClose}>
      <div className="recovery-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="recovery-header">
          <div className="recovery-logo">
            <img src="/logo.png" alt="Valle Reque" />
          </div>
          <button className="recovery-close" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="recovery-progress">
          <div className={`progress-step ${step === "email" ? "active" : "completed"}`}>
            <div className="step-circle">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <span>Email</span>
          </div>
          <div className="progress-line"></div>
          <div
            className={`progress-step ${step === "code" ? "active" : step === "password" || step === "success" ? "completed" : ""}`}
          >
            <div className="step-circle">
              <FontAwesomeIcon icon={faShieldAlt} />
            </div>
            <span>Código</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step === "password" ? "active" : step === "success" ? "completed" : ""}`}>
            <div className="step-circle">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <span>Nueva Contraseña</span>
          </div>
        </div>

        {/* Content */}
        <div className="recovery-content">
          {/* Paso 1: Email */}
          {step === "email" && (
            <div className="recovery-step">
              <h2>Recuperar Contraseña</h2>
              <p>Ingresa tu correo electrónico para recibir un código de recuperación</p>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <div className="input-container">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <input
                    type="email"
                    placeholder="ejemplo@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    className={email && !isValidDomain(email) ? "error" : ""}
                  />
                </div>
                {email && !isValidDomain(email) && (
                  <span className="error-text">Solo se permiten emails de Gmail, Hotmail o Outlook</span>
                )}
              </div>

              <button
                className="recovery-button primary"
                onClick={handleSendRecoveryCode}
                disabled={isLoading || !isValidDomain(email)}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faEnvelope} />
                    Enviar Código
                  </>
                )}
              </button>
            </div>
          )}

          {/* Paso 2: Código */}
          {step === "code" && (
            <div className="recovery-step">
              <button className="back-button" onClick={() => setStep("email")}>
                <FontAwesomeIcon icon={faArrowLeft} />
                Volver
              </button>

              <h2>Verificar Código</h2>
              <p>
                Hemos enviado un código de 9 dígitos a<br />
                <strong>{email}</strong>
              </p>

              <div className="form-group">
                <label>Código de Verificación (XXX-XXX-XXX)</label>
                <div className="input-container">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <input
                    type="text"
                    placeholder="000-000-000"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    maxLength={11}
                    className="code-input"
                  />
                </div>
              </div>

              <button
                className="recovery-button primary"
                onClick={handleVerifyCode}
                disabled={isLoading || code.length < 11}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Verificar Código
                  </>
                )}
              </button>

              <div className="resend-section">
                {resendTimer > 0 ? (
                  <span className="resend-timer">Podrás reenviar en {resendTimer} segundos</span>
                ) : (
                  <button className="resend-button" onClick={handleResendCode} disabled={isLoading}>
                    Reenviar código
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Paso 3: Nueva Contraseña */}
          {step === "password" && (
            <div className="recovery-step">
              <button className="back-button" onClick={() => setStep("code")}>
                <FontAwesomeIcon icon={faArrowLeft} />
                Volver
              </button>

              <h2>Nueva Contraseña</h2>
              <p>Crea una nueva contraseña segura para tu cuenta</p>

              <div className="form-group">
                <label>Nueva Contraseña</label>
                <div className="input-container">
                  <FontAwesomeIcon icon={faLock} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setError("")
                    }}
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>

                {/* Indicadores de validación */}
                {newPassword && (
                  <div className="password-requirements">
                    <div className={`requirement ${passwordValidation.minLength ? "valid" : "invalid"}`}>
                      <FontAwesomeIcon icon={passwordValidation.minLength ? faCheckCircle : faTimes} />
                      Mínimo 8 caracteres
                    </div>
                    <div className={`requirement ${passwordValidation.hasUpperCase ? "valid" : "invalid"}`}>
                      <FontAwesomeIcon icon={passwordValidation.hasUpperCase ? faCheckCircle : faTimes} />
                      Al menos 1 mayúscula
                    </div>
                    <div className={`requirement ${passwordValidation.hasSpecialChar ? "valid" : "invalid"}`}>
                      <FontAwesomeIcon icon={passwordValidation.hasSpecialChar ? faCheckCircle : faTimes} />
                      Al menos 1 carácter especial (!@#$%^&*)
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <div className="input-container">
                  <FontAwesomeIcon icon={faLock} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError("")
                    }}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="error-text">Las contraseñas no coinciden</span>
                )}
              </div>

              <button
                className="recovery-button primary"
                onClick={handleChangePassword}
                disabled={isLoading || !passwordValidation.isValid || newPassword !== confirmPassword}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="spin" />
                    Cambiando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Cambiar Contraseña
                  </>
                )}
              </button>
            </div>
          )}

          {/* Paso 4: Éxito */}
          {step === "success" && (
            <div className="recovery-step success">
              <div className="success-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h2>¡Contraseña Cambiada!</h2>
              <p>Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>

              <button className="recovery-button primary" onClick={handleClose}>
                Ir al Login
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="recovery-message error">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {error}
          </div>
        )}

        {success && (
          <div className="recovery-message success">
            <FontAwesomeIcon icon={faCheckCircle} />
            {success}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecuperarContraseña
