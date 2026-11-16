import { useState, type FormEvent } from 'react';
import { authApi, type OidcConfigurationView } from '../api/auth.js';

interface Props {
  configuration: OidcConfigurationView;
  onConfigurationChange: (configuration: OidcConfigurationView) => void;
  onMessage: (message: string) => void;
}

export default function PasskeySettingsPanel({ configuration, onConfigurationChange, onMessage }: Props) {
  const [name, setName] = useState('Mi passkey');
  const [busy, setBusy] = useState(false);
  const [totpSetup, setTotpSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');

  const registerInitial = async () => {
    setBusy(true); onMessage('Sigue las instrucciones del autenticador para registrar tu passkey…');
    try {
      const result = await authApi.registerPasskey(name.trim());
      const current = await authApi.getOidcConfiguration();
      onConfigurationChange({ ...current, passkeyCount: result.passkeyCount });
      onMessage('Passkey registrada. El inicio protegido podrá completarse con esta credencial.');
    } catch (error) { onMessage(error instanceof Error ? error.message : 'No se pudo registrar la passkey.'); }
    finally { setBusy(false); }
  };

  const addPasskey = async () => {
    const nextName = window.prompt('Nombre para la nueva passkey', `Passkey ${((configuration.passkeyCount ?? 0) + 1).toLocaleString('es-ES')}`);
    if (!nextName?.trim()) return;
    setBusy(true); onMessage('Verifica tu passkey actual y registra la nueva credencial…');
    try { onConfigurationChange(await authApi.addPasskey(nextName.trim())); onMessage('Passkey añadida.'); }
    catch (error) { onMessage(error instanceof Error ? error.message : 'No se pudo añadir la passkey.'); }
    finally { setBusy(false); }
  };

  const renamePasskey = async (id: string, currentName: string) => {
    const nextName = window.prompt('Nuevo nombre para la passkey', currentName);
    if (!nextName?.trim() || nextName.trim() === currentName) return;
    setBusy(true); onMessage('Verifica tu passkey para cambiar el nombre…');
    try {
      const result = await authApi.renamePasskey(id, nextName.trim());
      onConfigurationChange({ ...configuration, passkeys: result.passkeys, passkeyCount: result.passkeys.length });
      onMessage('Nombre de passkey actualizado.');
    } catch (error) { onMessage(error instanceof Error ? error.message : 'No se pudo renombrar la passkey.'); }
    finally { setBusy(false); }
  };

  const revokePasskey = async (id: string, passkeyName: string) => {
    if (!window.confirm(`¿Revocar la passkey «${passkeyName}»? Esta acción cerrará todas las sesiones protegidas.`)) return;
    setBusy(true); onMessage('Verifica tu passkey para revocar la credencial…');
    try {
      const result = await authApi.revokePasskey(id);
      onConfigurationChange({ ...configuration, passkeys: result.passkeys, passkeyCount: result.passkeys.length });
      onMessage('Passkey revocada.');
    } catch (error) { onMessage(error instanceof Error ? error.message : 'No se pudo revocar la passkey.'); }
    finally { setBusy(false); }
  };

  const setupTotp = async () => {
    setBusy(true); onMessage('Verifica tu passkey y configura la app autenticadora…');
    try {
      setTotpSetup(await authApi.beginTotpEnrollment());
      setTotpCode('');
      onMessage('Copia la clave en tu app autenticadora y confirma con el código actual.');
    }
    catch (error) { onMessage(error instanceof Error ? error.message : 'No se pudo configurar TOTP.'); }
    finally { setBusy(false); }
  };

  const confirmTotp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(totpCode)) return;
    setBusy(true); onMessage('Validando el código de confirmación…');
    try {
      onConfigurationChange(await authApi.confirmTotpEnrollment(totpCode));
      setTotpSetup(null); setTotpCode('');
      onMessage('Recuperación TOTP activada. Guarda la clave en tu app autenticadora.');
    } catch (error) { onMessage(error instanceof Error ? error.message : 'No se pudo confirmar TOTP.'); }
    finally { setBusy(false); }
  };

  const disableTotp = async () => {
    if (!window.confirm('¿Desactivar TOTP? Asegúrate de tener acceso a tus passkeys.')) return;
    setBusy(true); onMessage('Verifica tu passkey para desactivar TOTP…');
    try { onConfigurationChange(await authApi.disableTotp()); onMessage('Recuperación TOTP desactivada.'); }
    catch (error) { onMessage(error instanceof Error ? error.message : 'No se pudo desactivar TOTP.'); }
    finally { setBusy(false); }
  };

  if (configuration.identityLinked && !(configuration.passkeyCount ?? 0) && configuration.mode === 'local') {
    return <div className="provider-passkey-setup">
      <label className="provider-field"><span>Nombre de la passkey</span><input value={name} maxLength={64} onChange={(event) => setName(event.target.value)} disabled={busy} /></label>
      <button type="button" className="quiet-button" disabled={busy || !name.trim()} onClick={() => void registerInitial()}>{busy ? 'Esperando autenticador…' : 'Registrar passkey inicial'}</button>
    </div>;
  }

  if (!(configuration.passkeyCount ?? 0)) return null;
  return <div className="provider-passkey-list">
    <p role="status">Hay {configuration.passkeyCount} passkey(s) registradas.</p>
    {(configuration.passkeys ?? []).map((key) => <div className="provider-passkey-row" key={key.id}>
      <span><strong>{key.name}</strong><small>{key.deviceType === 'multiDevice' ? 'Sincronizable' : 'Dispositivo único'} · {key.lastUsedAt ? `Usada ${new Date(key.lastUsedAt).toLocaleString()}` : `Registrada ${new Date(key.createdAt).toLocaleDateString()}`}</small></span>
      {configuration.mode === 'protected' && <div>
        <button type="button" className="quiet-button" disabled={busy} onClick={() => void renamePasskey(key.id, key.name)}>Renombrar</button>
        <button type="button" className="quiet-button" disabled={busy || (configuration.passkeyCount ?? 0) <= 1} onClick={() => void revokePasskey(key.id, key.name)}>Revocar</button>
      </div>}
    </div>)}
    {configuration.mode === 'protected' && <section className="provider-passkey-setup" aria-label="Recuperación TOTP">
      <strong>Recuperación con código temporal</strong>
      <p>Solo permite registrar una passkey nueva; no abre tus proyectos ni da acceso al chat.</p>
      {totpSetup && <form onSubmit={(event) => void confirmTotp(event)} aria-labelledby="totp-enrollment-title">
        <h3 id="totp-enrollment-title">Configurar app autenticadora</h3>
        <p>Escanea el URI si tu app está disponible en este equipo o introduce manualmente esta clave. La clave se mostrará solo durante este enrolamiento.</p>
        <label className="provider-field" htmlFor="totp-secret"><span>Clave manual</span><input id="totp-secret" value={totpSetup.secret} readOnly onFocus={(event) => event.currentTarget.select()} /></label>
        <details><summary>Ver URI de configuración</summary><code className="totp-setup-uri">{totpSetup.otpauthUrl}</code></details>
        <label className="provider-field" htmlFor="totp-confirmation-code"><span>Código de seis dígitos</span>
          <input id="totp-confirmation-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={totpCode} onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required disabled={busy} autoFocus />
        </label>
        <div className="provider-passkey-row"><button type="submit" className="quiet-button" disabled={busy || !/^\d{6}$/.test(totpCode)}>{busy ? 'Confirmando…' : 'Confirmar TOTP'}</button>
          <button type="button" className="quiet-button" disabled={busy} onClick={() => { setTotpSetup(null); setTotpCode(''); }}>Cancelar</button></div>
      </form>}
      {!totpSetup && (configuration.totpEnabled
        ? <button type="button" className="quiet-button" disabled={busy} onClick={() => void disableTotp()}>Desactivar recuperación TOTP</button>
        : <button type="button" className="quiet-button" disabled={busy} onClick={() => void setupTotp()}>Configurar app autenticadora</button>)}
    </section>}
    {configuration.mode === 'protected' ? <button type="button" className="quiet-button" disabled={busy} onClick={() => void addPasskey()}>{busy ? 'Verificando…' : 'Añadir otra passkey'}</button> : <p>Para gestionar las credenciales, inicia en modo protegido.</p>}
  </div>;
}
