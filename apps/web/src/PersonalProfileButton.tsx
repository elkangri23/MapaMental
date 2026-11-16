import { useRef, useState, type FormEvent } from 'react';
import { profileApi, type PersonalProfile } from './api/projects.js';

export function PersonalProfileButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [profile, setProfile] = useState<PersonalProfile>({ name: '', email: '' });
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoaded(false);
    setError('');
    setBusy(true);
    try {
      const result = await profileApi.get();
      setProfile(result.profile);
      setLoaded(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo abrir el perfil.');
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loaded || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await profileApi.save(profile);
      setProfile(result.profile);
      dialog.current?.close();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo guardar el perfil.');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" className="avatar" aria-label="Mi perfil" aria-haspopup="dialog"
      onClick={() => { dialog.current?.showModal(); void load(); }}>Perfil</button>
    <dialog ref={dialog} className="recovery-dialog deck-dialog" aria-labelledby="personal-profile-title"
      onCancel={(event) => { if (busy) event.preventDefault(); }}>
      <form onSubmit={(event) => void save(event)}>
        <h2 id="personal-profile-title">Mi perfil</h2>
        <p>El nombre y el correo se guardan en este equipo.</p>
        {busy && !loaded && <p role="status">Cargando perfil…</p>}
        {error && <p role="alert">{error}</p>}
        {loaded && <fieldset disabled={busy}>
          <legend>Datos personales</legend>
          <label className="provider-field">Nombre
            <input autoComplete="name" value={profile.name} maxLength={120}
              onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
          </label>
          <label className="provider-field">Correo electrónico
            <input type="email" autoComplete="email" value={profile.email} maxLength={254}
              onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
          </label>
        </fieldset>}
        <footer className="provider-actions">
          <button type="button" className="quiet-button" disabled={busy} onClick={() => dialog.current?.close()}>Cerrar</button>
          {loaded
            ? <button type="submit" className="quiet-button provider-test" disabled={busy}>{busy ? 'Guardando…' : 'Guardar perfil'}</button>
            : <button type="button" className="quiet-button" disabled={busy} onClick={() => void load()}>Reintentar</button>}
        </footer>
      </form>
    </dialog>
  </>;
}
