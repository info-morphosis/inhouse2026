// Normaliza un celular ecuatoriano de 10 dígitos (que inicia con 0) al formato
// internacional que usa WhatsApp/Twilio. Ej: "0984309726" -> "+593984309726".
// Robusto: elimina cualquier caracter no numérico y quita un 0 inicial.
export function normalizarWhatsappEc(telefono: string): string {
  const digits = (telefono || '').replace(/\D/g, '')
  return '+593' + digits.replace(/^0/, '')
}
