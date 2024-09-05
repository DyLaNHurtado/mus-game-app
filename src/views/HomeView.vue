<template>
  <div class="min-h-screen flex flex-col items-center text-white p-5 bg-gradient-to-b from-gray-900 to-gray-800">
    <!-- Logo y Texto Principal -->
    <div class="flex flex-col items-center mb-8">
      <img src="@/assets/logo.png" alt="Mus App Logo" class="w-32 h-32 mb-4" />
      <h1 class="text-center text-gray-300 text-lg font-semibold px-4">Disfruta del mus sin conexión o con tus amigos</h1>
    </div>
    
    <!-- Tarjetas de Opciones -->
    <div class="flex flex-col space-y-4 w-full max-w-lg">
      <router-link to="/play-offline" class="card">
        <h2 class="text-2xl font-bold">Jugar sin conexión</h2>
        <p class="text-gray-400 mt-2">Crea una nueva partida con tus amigos y juega en la mesa.</p>
      </router-link>
      
      <div class="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4">
        <router-link to="/room" class="card flex-1">
          <h2 class="text-2xl font-bold">Crear Sala</h2>
          <p class="text-gray-400 mt-2">Crea una nueva partida para jugar en línea con amigos.</p>
        </router-link>

        <router-link to="/join-room" class="card flex-1">
          <h2 class="text-2xl font-bold">Unirse a Sala</h2>
          <p class="text-gray-400 mt-2">Únete a una sala existente mediante un código.</p>
        </router-link>
      </div>
    </div>

    <!-- Botones de Configuración y Cómo Jugar -->
      <router-link to="/options" class="btn-icon absolute top-4 left-4">
        <svg class="w-8 h-8 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
            d="M20 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6h-2m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4" />
        </svg>
      </router-link>

      <router-link to="/how-to-play" class="btn-icon absolute top-4 right-4">
        <svg class="w-8 h-8 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </router-link>

    <!-- Navegación Inferior -->
    <nav class="fixed bottom-0 w-full bg-gray-900 border-t border-gray-800 shadow">
      <div class="flex justify-center">
        <router-link  to="/shop" class="nav-btn">
          <svg class="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 10V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v4m3-2 .917 11.923A1 1 0 0 1 17.92 21H6.08a1 1 0 0 1-.997-1.077L6 8h12Z" />
          </svg>
          <span class="text-sm mt-2">Tienda</span>
        </router-link>
        <router-link to="/" class="nav-btn">
          <svg class="w-8 h-8 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 18V6l8 6-8 6Z" />
          </svg>
          <span class="text-sm mt-2">Jugar</span>
        </router-link>
        <router-link to="/profile" class="nav-btn">
          <svg class="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span class="text-sm mt-2">Perfil</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: "HomeView",
};
</script>

<style scoped>

/* Estilo de Tarjetas */
.card {
  @apply bg-gray-800 hover:bg-gray-700 p-5 rounded-lg flex flex-col items-start justify-start text-white transition duration-300 min-h-48 shadow-md;
}

/* Navegación Inferior */
.nav-btn {
  @apply  hover:bg-gray-700 flex flex-col items-center w-full h-full p-4 text-gray-400 hover:text-white transition duration-300;
}
</style>
