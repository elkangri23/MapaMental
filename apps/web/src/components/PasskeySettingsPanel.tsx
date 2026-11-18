import { useEffect, useRef, useState, type FormEvent } from 'react';
import { authApi, type OidcConfigurationView } from '../api/auth.js';

type PasskeyAction = { type: 'add' } | { type: 'rename' | 'revoke'; id: string; name: string } | { type: 'disable-totp' };

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
  const [action, setAction] = useState<PasskeyAction | null>(null);
  const [actionValue, setActionValue] = useState('');
  const actionInputRef = useRef<HTMLInputElement>(null);
  const actionConfirmRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!action) return;
    if (action.type === 'revoke' || action.type === 'disable-totp') actionConfirmRef.current?.focus();
    else actionInputRef.current?.focus();
  }, [action]);

  const beginAction = (next: PasskeyAction, trigger: HTMLElement, value = '') => {
    returnFocusRef.current = trigger;
    setActionValue(value);
    setAction(next);
  };

  const closeAction = () => {
    setAction(null);
    setActionValue('');
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  const submitAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!action || busy) return;
    setBusy(true);
    try {
      if (action.type === 'add') {
        const nextName = actionValue.trim();
        if (!nextName) return;
        onMessage('Verifica tu passkey actual y registra la nueva credencial…');
        onConfigurationChange(await authApi.addPasskey(nextName));
        onMessage('Passkey añadida.');
      } else if (action.type === 'rename') {
        const nextName = actionValue.trim();
        if (!nextName || nextName === action.name) return;
        onMessage('Verifica tu passkey para cambiar el nombre…');
        const result = await authApi.renamePasskey(action.id, nextName);
        onConfigurationChange({ ...configuration, passkeys: result.passkeys, passkeyCount: result.passkeys.length });
        onMessage('Nombre de passkey actualizado.');
      } else if (action.type === 'revoke') {
        onMessage('Verifica tu passkey para revocar la credencial…');
        const result = await authApi.revokePasskey(action.id);
        onConfigurationChange({ ...configuration, passkeys: result.passkeys, passkeyCount: result.passkeys.length });
        onMessage('Passkey revocada. Se han cerrado las sesiones protegidas; vuelve a iniciar sesión.');
      } else {
        onMessage('Verifica tu passkey para desactivar TOTP…');
        onConfigurationChange(await authApi.disableTotp());
        onMessage('Recuperación TOTP desactivada.');
      }
      closeAction();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'No se pudo completar la operación de passkey.');
    } finally { setBusy(false); }
  };

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
        <button type="button" className="quiet-button" disabled={busy || !!action} onClick={(event) => beginAction({ type: 'rename', id: key.id, name: key.name }, event.currentTarget, key.name)}>Renombrar</button>
        <button type="button" className="quiet-button" disabled={busy || !!action || (configuration.passkeyCount ?? 0) <= 1} onClick={(event) => beginAction({ type: 'revoke', id: key.id, name: key.name }, event.currentTarget)}>Revocar</button>
      </div>}
      {action && 'id' in action && action.id === key.id && <form className="provider-passkey-action" onSubmit={(event) => void submitAction(event)} aria-label={action.type === 'rename' ? `Renombrar ${key.name}` : `Confirmar revocación de ${key.name}`}>
        {action.type === 'rename'
          ? <label className="provider-field"><span>Nuevo nombre para {key.name}</span><input ref={actionInputRef} value={actionValue} maxLength={64} onChange={(event) => setActionValue(event.target.value)} required disabled={busy} /></label>
          : <p role="status">Se revocará «{key.name}» y se cerrarán todas las sesiones protegidas. Tendrás que volver a iniciar sesión.</p>}
        <div className="provider-passkey-row"><button ref={action.type === 'revoke' ? actionConfirmRef : undefined} type="submit" className="quiet-button" disabled={busy || (action.type === 'rename' && (!actionValue.trim() || actionValue.trim() === action.name))}>{action.type === 'rename' ? 'Guardar nombre' : 'Confirmar revocación'}</button>
          <button type="button" className="quiet-button" disabled={busy} onClick={closeAction}>Cancelar</button></div>
      </form>}
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
        ? <><button type="button" className="quiet-button" disabled={busy || !!action} onClick={(event) => beginAction({ type: 'disable-totp' }, event.currentTarget)}>Desactivar recuperación TOTP</button>
          {action?.type === 'disable-totp' && <form className="provider-passkey-action" onSubmit={(event) => void submitAction(event)} aria-label="Confirmar desactivación de TOTP"><p role="status">Al desactivar TOTP perderás este método de recuperación. Asegúrate de conservar acceso a tus passkeys.</p>
            <div className="provider-passkey-row"><button ref={actionConfirmRef} type="submit" className="quiet-button" disabled={busy}>Confirmar desactivación</button><button type="button" className="quiet-button" disabled={busy} onClick={closeAction}>Cancelar</button></div></form>}</>
        : <button type="button" className="quiet-button" disabled={busy} onClick={() => void setupTotp()}>Configurar app autenticadora</button>)}
    </section>}
    {configuration.mode === 'protected' ? <><button type="button" className="quiet-button" disabled={busy || !!action} onClick={(event) => beginAction({ type: 'add' }, event.currentTarget, `Passkey ${((configuration.passkeyCount ?? 0) + 1).toLocaleString('es-ES')}`)}>{busy ? 'Verificando…' : 'Añadir otra passkey'}</button>
      {action?.type === 'add' && <form className="provider-passkey-action" onSubmit={(event) => void submitAction(event)} aria-label="Añadir una passkey"><label className="provider-field"><span>Nombre para la nueva passkey</span><input ref={actionInputRef} value={actionValue} maxLength={64} onChange={(event) => setActionValue(event.target.value)} required disabled={busy} /></label>
        <div className="provider-passkey-row"><button type="submit" className="quiet-button" disabled={busy || !actionValue.trim()}>{busy ? 'Esperando passkey…' : 'Continuar con passkey'}</button><button type="button" className="quiet-button" disabled={busy} onClick={closeAction}>Cancelar</button></div></form>}</> : <p>Para gestionar las credenciales, inicia en modo protegido.</p>}
  </div>;
}
