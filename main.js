// 2. Configura tus credenciales (Usa las mismas de tu archivo .env de Python)
        const SUPABASE_URL = "https://ddmnhwvzqbojbfqjhrio.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbW5od3Z6cWJvamJmcWpocmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NTM4NDcsImV4cCI6MjEwMDEyOTg0N30.bePsqv4Qa5e_Edee-AkJCv9wN4faobh_cmF0TEYjlk0";
        
        // Inicializamos el cliente de Supabase en el navegador
        const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // 3. Capturar el ID del Quizz desde la URL (?id=xxxx)
        const parametrosURL = new URLSearchParams(window.location.search);
        const idQuizz = parametrosURL.get('id');

        // Función principal que arranca al cargar la página
        async function iniciarJuego() {
            const contenedor = document.getElementById("contenedor-pantalla");

            if (!idQuizz) {
                contenedor.innerHTML = "<h2>⚠️ Error: No se encontró ningún código de juego.</h2><p>Escanea el QR de nuevo.</p>";
                return;
            }

            console.log("Descargando el Quizz con ID:", idQuizz);

            try {
                // 4. La consulta relacional en JavaScript (Equivalente al JOIN de tu backend)
                // Traemos la relación usando los nuevos nombres con guiones bajos
                const { data, error } = await supabase
                    .from('Quizz_Preguntas')
                    .select(`
                        index_pregunta,
                        Preguntas (
                            id_pregunta,
                            texto_pregunta,
                            Preguntas_Opciones (
                                index_opcion,
                                Opciones (
                                    id_opcion,
                                    texto_opcion,
                                    puntaje
                                )
                            )
                        )
                    `)
                    .eq('id_quizz', idQuizz);

                if (error) throw error;

                if (!data || data.length === 0) {
                    contenedor.innerHTML = "<h2>⚠️ El juego no existe o no tiene preguntas.</h2>";
                    return;
                }

                // Guardamos los datos en la consola del navegador para verificar el formato
                console.log("¡Datos del Quizz descargados con éxito!", data);
                
                // 5. Renderizado básico de prueba en la pantalla del celular
                mostrarEstructuraPrueba(data, contenedor);

            } catch (err) {
                console.error("Error al conectar con Supabase:", err);
                contenedor.innerHTML = "<h2>💥 Hubo un problema al cargar las preguntas.</h2>";
            }
        }

        function mostrarEstructuraPrueba(data, contenedor) {
            // Limpiamos el mensaje de "Cargando..."
            contenedor.innerHTML = "<h1>🎮 ¡Partida Encontrada!</h1><hr>";

            // Recorremos las preguntas estructuradas que nos devolvió Supabase
            data.forEach(item => {
                const pregunta = item.Preguntas;
                
                // Creamos el bloque de la pregunta
                const bloquePregunta = document.createElement("div");
                bloquePregunta.style.marginBottom = "30px";
                bloquePregunta.style.textAlign = "left";
                
                bloquePregunta.innerHTML = `<h3>${item.index_pregunta}. ${pregunta.texto_pregunta}</h3>`;

                // Recorremos y añadimos sus opciones correspondientes
                pregunta.Preguntas_Opciones.forEach(relOpcion => {
                    const opcion = relOpcion.Opciones;
                    bloquePregunta.innerHTML += `
                        <label style="display: block; margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                            <input type="radio" name="pregunta_${pregunta.id_pregunta}" value="${opcion.id_opcion}">
                            ${opcion.texto_opcion} (Puntos: ${opcion.puntaje})
                        </label>
                    `;
                });

                contenedor.appendChild(bloquePregunta);
            });
        }

        // Ejecutar la lógica inmediatamente al abrir la página
        iniciarJuego();