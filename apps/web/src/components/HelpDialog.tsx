import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HelpDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  return <dialog ref={dialogRef} className="recovery-dialog help-dialog" aria-labelledby="help-title" onClose={onClose}>
    <header className="recovery-dialog__head">
      <div><strong id="help-title">Ayuda · empieza aquí</strong><small>Guía rápida de Espacio Visual</small></div>
      <button ref={closeButtonRef} type="button" className="round-button" aria-label="Cerrar ayuda" onClick={() => dialogRef.current?.close()}>×</button>
    </header>
    <nav className="help-nav" aria-label="Secciones de ayuda">
      <a href="#help-start">Primeros pasos</a><a href="#help-map">Crear un mapa</a><a href="#help-ai">Usar la IA</a>
      <a href="#help-slides">Presentaciones</a><a href="#help-providers">Proveedores</a><a href="#help-faq">Preguntas frecuentes</a>
    </nav>
    <div className="help-content">
      <section id="help-start" aria-labelledby="help-start-title">
        <h2 id="help-start-title">Primeros pasos</h2>
        <ol>
          <li>Abre un proyecto desde el selector superior o pulsa <strong>＋ Proyecto</strong> para empezar uno nuevo.</li>
          <li>Escribe una idea central y crea ideas relacionadas con <strong>＋ Añadir idea</strong>.</li>
          <li>Configura un proveedor en <strong>⚙ Proveedores de IA</strong> si quieres conversar, generar sugerencias o crear borradores con IA. La app también funciona sin IA para organizar mapas y editar presentaciones.</li>
          <li>El guardado es local y automático. Espera a que aparezca <strong>Guardado local</strong> antes de cerrar. Usa <strong>Copias</strong> para recuperar una versión anterior.</li>
        </ol>
        <p>La primera vez se crea un proyecto de muestra con una idea central y cuatro ramas para que puedas probar el mapa; puedes renombrar esas ideas o crear tu propio proyecto.</p>
      </section>

      <section id="help-map" aria-labelledby="help-map-title">
        <h2 id="help-map-title">Crear y editar un mapa mental</h2>
        <ul>
          <li><strong>Añadir:</strong> selecciona una idea y pulsa <strong>＋ Añadir idea</strong>. La nueva idea se agrega bajo la selección actual.</li>
          <li><strong>Editar:</strong> haz doble clic en una idea, o selecciónala y pulsa <kbd>Intro</kbd> o <kbd>F2</kbd>. Confirma con <kbd>Intro</kbd> o sal del campo; <kbd>Escape</kbd> cancela.</li>
          <li><strong>Conectar:</strong> arrastra el tirador de un lado de una idea al tirador de otra. Una conexión expresa una relación, aunque no cambie la jerarquía.</li>
          <li><strong>Mover y explorar:</strong> arrastra ideas, usa los controles de zoom o pulsa <strong>Ordenar</strong>. <strong>Vista de lista</strong> ofrece una alternativa navegable por teclado.</li>
          <li><strong>Eliminar:</strong> selecciona una idea y usa el botón de papelera para borrar esa rama y sus descendientes. La idea central no se elimina.</li>
        </ul>
        <p>Seleccionar una rama también determina el ámbito que la IA usa para desarrollar una idea. El mapa admite hasta 10.000 ideas.</p>
      </section>

      <section id="help-ai" aria-labelledby="help-ai-title">
        <h2 id="help-ai-title">Chat y sugerencias inteligentes</h2>
        <ol>
          <li>Configura y activa un proveedor; luego selecciona la idea central o la rama que quieres trabajar.</li>
          <li>Pulsa <strong>Generar sugerencias</strong> para pedir acciones siguientes relacionadas con ese ámbito, o escribe una petición concreta en el chat. Puedes preguntar por modelos de negocio, planificación, recorridos, formularios de ejemplo, tablas o diagramas.</li>
          <li>Al pulsar una tarjeta de sugerencia, la app pide un borrador para esa acción. Revisa la propuesta antes de aplicarla: la IA no cambia el proyecto por sí sola.</li>
          <li>Comprueba el destino, los cambios y cualquier dato marcado como pendiente. Después pulsa el botón para aplicarlo. La última operación IA se puede deshacer.</li>
        </ol>
        <p>Las sugerencias se han afinado en el prompt, el contexto por rama y los filtros del servidor. No se han entrenado ni ajustado los pesos de un modelo. Las pruebas con FreeLLMAPI han mejorado las instrucciones y detectado errores típicos, pero la pertinencia depende del modelo y del contenido del mapa; revisa siempre fechas, cifras y recomendaciones.</p>
        <p>Antes de enviar, pulsa <strong>Ver contexto</strong> para ver qué ideas, relaciones y fragmentos acompañan la petición. Un proveedor remoto recibe ese contexto; un servidor local mantiene la petición en el equipo según la configuración de red de tu proveedor.</p>
      </section>

      <section id="help-slides" aria-labelledby="help-slides-title">
        <h2 id="help-slides-title">Crear y presentar diapositivas</h2>
        <ol>
          <li>Pulsa <strong>Crear presentación</strong>. Puedes agrupar ideas del mapa sin IA o generar un borrador con IA y elegir la cantidad.</li>
          <li>Edita título, subtítulo, texto e ideas clave. Navega con <strong>Anterior</strong>/<strong>Siguiente</strong> y cambia el orden con <strong>Mover antes</strong>/<strong>Mover después</strong>.</li>
          <li>En la diapositiva actual puedes añadir una tabla, un recorrido visual o un formulario ficticio. Son elementos editables/estáticos; el formulario no envía datos y el recorrido no es un prototipo ejecutable.</li>
          <li><strong>Mejorar con IA</strong> crea una propuesta para la diapositiva actual. Revísala y aplícala solo cuando te convenza.</li>
          <li>Usa <strong>Imprimir / Guardar PDF</strong> para exportar toda la presentación o <strong>Exportar PNG</strong> para guardar la diapositiva actual.</li>
        </ol>
        <p>La conversión local permite de 1 a 100 diapositivas. La generación IA permite de 1 a 12; si dejas la cantidad vacía, el modelo propone entre 3 y 7.</p>
      </section>

      <section id="help-providers" aria-labelledby="help-providers-title">
        <h2 id="help-providers-title">Configurar el proveedor de IA</h2>
        <p>En <strong>⚙ Proveedores de IA</strong>, elige el tipo, indica modelo y, si hace falta, clave. Pulsa <strong>Probar conexión</strong>, selecciona un modelo disponible y guarda. El control consulta el catálogo de modelos; una conexión correcta no garantiza que el modelo complete una generación.</p>
        <ul>
          <li><strong>Ollama:</strong> inicia Ollama y descarga un modelo. La URL predeterminada es <code>http://127.0.0.1:11434</code>.</li>
          <li><strong>LM Studio:</strong> carga un modelo y activa el servidor local compatible con OpenAI. La URL predeterminada es <code>http://127.0.0.1:1234</code>; normalmente el catálogo está en <code>/v1/models</code>.</li>
          <li><strong>OpenAI:</strong> usa la API oficial y una clave API.</li>
          <li><strong>Anthropic:</strong> usa su API y una clave API.</li>
          <li><strong>Compatible con OpenAI:</strong> para servidores propios o gateways que implementen el protocolo de chat compatible. Introduce su URL base, ID del modelo y credencial si la requiere.</li>
        </ul>
        <p>El adaptador de LM Studio está implementado. Se han recorrido adaptadores con proveedores simulados y se ha evaluado la calidad con modelos remotos a través de FreeLLMAPI; Ollama y LM Studio locales reales todavía no tienen aceptación completa en este proyecto. FreeLLMAPI no es un tipo de proveedor separado: se configura como compatible con OpenAI, tal como explica una de las preguntas frecuentes.</p>
        <p>Las claves de OpenAI, Anthropic y servidores compatibles se guardan en el almacén de credenciales de Windows, fuera del proyecto. En perfiles remotos puedes definir un presupuesto y tarifas para calcular gasto estimado; un campo vacío significa sin límite. Los presupuestos no se aplican a direcciones locales.</p>
      </section>

      <section aria-labelledby="help-privacy-title">
        <h2 id="help-privacy-title">Proyectos, perfil y privacidad</h2>
        <ul>
          <li>Los proyectos, mapas, diapositivas, chat y copias se guardan en este equipo. No hay sincronización en nube ni colaboración multiusuario.</li>
          <li>El chat y las sugerencias se guardan en el proyecto local. Solo se comparte contexto con IA cuando envías un mensaje o generas una propuesta.</li>
          <li>El perfil permite guardar nombre y correo en el equipo; el correo no se verifica ni se usa para iniciar sesión.</li>
          <li>La identidad OIDC, MFA y passkeys son un modo protegido experimental. No lo actives como barrera de seguridad hasta validar tu IdP, passkeys y recuperación TOTP.</li>
        </ul>
      </section>

      <section id="help-faq" aria-labelledby="help-faq-title">
        <h2 id="help-faq-title">Preguntas frecuentes</h2>
        <details><summary>¿Las sugerencias están afinadas o se ha entrenado un modelo?</summary><p>Se han afinado instrucciones, contexto por rama, filtros de tema/destino y validación de propuestas. No hay fine-tuning ni pesos propios. FreeLLMAPI se usó para evaluar varios modelos; esas evaluaciones no garantizan el mismo resultado con otro modelo.</p></details>
        <details><summary>¿Funciona con la API de LM Studio?</summary><p>La aplicación tiene adaptador LM Studio con URL predeterminada <code>http://127.0.0.1:1234</code> y protocolo compatible con OpenAI. Activa el servidor de LM Studio, carga un modelo y selecciona el ID que publique. El código y la prueba de catálogo están implementados; falta validar generación y calidad con un servidor/modelo local real en este proyecto.</p></details>
        <details><summary>¿Por qué «Probar conexión» funciona pero la generación falla?</summary><p>La prueba consulta la lista de modelos. La generación usa el endpoint de chat y puede fallar por modelo descargado/no cargado, nombre de modelo distinto, formato incompatible, memoria disponible o timeout del proveedor. Prueba una petición sencilla y revisa el mensaje de error.</p></details>
        <details><summary>¿Puedo usar FreeLLMAPI?</summary><p>Sí. Crea un perfil «Compatible con OpenAI» con la URL base <code>http://127.0.0.1:31415/v1</code>. En un checkout del repositorio, la clave puede configurarse en <code>.env</code> usando la plantilla <code>.env.example</code>; nunca pegues la clave en el chat ni la subas al repositorio. FreeLLMAPI puede enviar los datos a modelos remotos.</p></details>
        <details><summary>¿Por qué una respuesta de IA marca información como pendiente?</summary><p>Para no presentar una suposición como un dato del proyecto. Completa el dato manualmente o pide al modelo que explique qué información necesita; revisa y corrige el borrador antes de aplicarlo.</p></details>
        <details><summary>¿Cómo recupero cambios?</summary><p>Espera a «Guardado local». Abre <strong>Copias</strong> para restaurar una versión anterior. Las propuestas IA se revisan antes de aplicar y la última aplicación se puede deshacer.</p></details>
        <details><summary>¿Puedo rellenar los formularios de ejemplo o ejecutar los diagramas?</summary><p>No. Los formularios son maquetas estáticas con datos ficticios y no envían información; los recorridos son representaciones visuales, no flujos ejecutables.</p></details>
      </section>
    </div>
  </dialog>;
}
