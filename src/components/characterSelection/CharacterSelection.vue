<template>
 <div class="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 flex flex-col">
    <h1 class="text-3xl font-bold text-center mb-4">Selecciona tu personaje</h1>
      <!-- Filtro de búsqueda -->
      <div class="mb-4">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar personajes..."
          class="w-full p-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

 <!-- Lista de personajes -->
      <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4 overflow-y-auto flex-grow" style="max-height: 50vh;">
      <div
        v-for="character in filteredCharacters"
        :key="character.id"
        @click="handleCharacterSelect(character)"
        class="cursor-pointer transition-all duration-300 transform hover:scale-105"
        :class="{ 'ring-2 ring-yellow-500': selectedCharacter?.id === character.id }"
      >
        <div class="aspect-square overflow-hidden rounded-lg">
          <img :src="character.image" :alt="character.name" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>

    <transition name="fade">
      <SelectionDetails :character="selectedCharacter"/>
    </transition>



      <div class="text-center">
      <button 
        @click="handleChooseCharacter"
        :disabled="!selectedCharacter"
        class="px-8 py-3 text-xl font-semibold rounded-full transition-all duration-300"
        :class="[
          !selectedCharacter ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 transform hover:scale-105'
        ]"
      >
        <span class="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Elegir
        </span>
      </button>
    </div>

  </div>
</template>
  <script>
  import SelectionDetails from './SelectionDetails.vue';
  
  export default {
    components: {
      SelectionDetails
    },
    data() {
      return {
        searchTerm: '',
        selectedSkill: '',
        characters: [
          // Lista completa de personajes
          {
            id: 1,
            name: 'El Viejo Sabio',
            skills: {
              Atrevido: 3,
              Faroleo: 5,
              CazaSeñas: 5,
              CortaMus: 4,
              Descartes: 3,
              Interactividad: 2
            },
            description: 'Este hombre mayor es la leyenda viva del Mus. Lleva jugando desde que se inventaron las cartas, o al menos eso dice él. Tiene una anécdota para cada jugada y siempre sabe qué estás pensando antes de que abras la boca.'
          },
          {
            id: 2,
            name: 'El Cani',
            skills: {
              Atrevido: 5,
              Faroleo: 3,
              CazaSeñas: 2,
              CortaMus: 3,
              Descartes: 5,
              Interactividad: 5
            },
            description: 'Con su chándal de marca, gorra plana y actitud desafiante, este tío vive el Mus como si fuera la última movida de la noche. Juega con descaro, más preocupado por impresionar que por ganar.'
          },
          {
            id: 3,
            name: 'La Influencer',
            skills: {
              Atrevido: 4,
              Faroleo: 5,
              CazaSeñas: 2,
              CortaMus: 2,
              Descartes: 3,
              Interactividad: 5
            },
            description: 'Vive por y para sus seguidores. No importa lo que pase en el Mus, siempre saca una foto o hace un directo. Es la reina de los faroles, pero ¿lo hará por estrategia o por los likes?'
          },
          {
            id: 4,
            name: 'El Alienígena',
            skills: {
              Atrevido: 4,
              Faroleo: 2,
              CazaSeñas: 5,
              CortaMus: 2,
              Descartes: 4,
              Interactividad: 1
            },
            description: 'Este ser de otro mundo tiene métodos de juego tan avanzados que ni él mismo los entiende. Siempre está a medio camino entre otra dimensión y la mesa de juego.'
          },
          {
            id: 5,
            name: 'El Hacker',
            skills: {
              Atrevido: 2,
              Faroleo: 3,
              CazaSeñas: 5,
              CortaMus: 5,
              Descartes: 4,
              Interactividad: 1
            },
            description: 'Para este tipo, el Mus es solo un código que descifrar. Cree que puede hackear el sistema, aunque olvida que el Mus es más arte que ciencia.'
          },
          {
            id: 6,
            name: 'La Gitana',
            skills: {
              Atrevido: 4,
              Faroleo: 3,
              CazaSeñas: 5,
              CortaMus: 3,
              Descartes: 4,
              Interactividad: 5
            },
            description: 'Esta experta en leer las palmas y las cartas puede ver tu jugada antes de que la hagas. O eso dice ella. Siempre te deja con la duda.'
          },
          {
            id: 7,
            name: 'El Rockero',
            skills: {
              Atrevido: 5,
              Faroleo: 3,
              CazaSeñas: 2,
              CortaMus: 2,
              Descartes: 3,
              Interactividad: 3
            },
            description: 'El Mus es solo un pasatiempo entre conciertos y motos. Va a lo loco, como si el juego fuera un solo de guitarra.'
          },
          {
            id: 8,
            name: 'El Empresario',
            skills: {
              Atrevido: 3,
              Faroleo: 4,
              CazaSeñas: 5,
              CortaMus: 5,
              Descartes: 3,
              Interactividad: 3
            },
            description: 'Ve el Mus como una negociación de alto nivel. Cada jugada es un movimiento estratégico, y siempre está midiendo riesgos y beneficios.'
          },
          {
            id: 9,
            name: 'El Punk',
            skills: {
              Atrevido: 5,
              Faroleo: 3,
              CazaSeñas: 2,
              CortaMus: 2,
              Descartes: 4,
              Interactividad: 5
            },
            description: 'El Mus para él es otra forma de rebelión. Va contra las normas, el sistema y cualquier cosa que no le guste en ese momento.'
          },
          {
            id: 10,
            name: 'El Científico Loco',
            skills: {
              Atrevido: 4,
              Faroleo: 4,
              CazaSeñas: 3,
              CortaMus: 3,
              Descartes: 4,
              Interactividad: 3
            },
            description: 'Con su bata manchada y pelo alborotado, juega al Mus como si fuera un experimento. Siempre está probando nuevas teorías, algunas brillantes y otras completamente desquiciadas.'
          },
          {
            id: 11,
            name: 'El Monje Zen',
            skills: {
              Atrevido: 2,
              Faroleo: 5,
              CazaSeñas: 5,
              CortaMus: 3,
              Descartes: 3,
              Interactividad: 2
            },
            description: 'Sereno como un lago, este monje no se deja llevar por la presión. Sus jugadas son siempre calmadas, pero algunos creen que es solo porque se distrae meditando.'
          },
          {
            id: 12,
            name: 'El Deportista de Élite',
            skills: {
              Atrevido: 4,
              Faroleo: 3,
              CazaSeñas: 4,
              CortaMus: 3,
              Descartes: 4,
              Interactividad: 3
            },
            description: 'Con la competitividad en las venas, juega al Mus como si fuera una final olímpica. No descansa hasta encontrar la estrategia ganadora, aunque a veces su exceso de energía la sobrepase.'
          },
          {
            id: 13,
            name: 'La Tía del Bingo',
            skills: {
              Atrevido: 3,
              Faroleo: 4,
              CazaSeñas: 4,
              CortaMus: 3,
              Descartes: 5,
              Interactividad: 5
            },
            description: 'Después de años de jugar al bingo, esta señora ha perfeccionado su capacidad para ganar juegos de azar. En el Mus, juega con la misma intensidad, pero su verdadera habilidad es saber cuándo hablar y cuándo quedarse callada.'
          },
          {
            id: 14,
            name: 'El Chef Gurú',
            skills: {
              Atrevido: 4,
              Faroleo: 4,
              CazaSeñas: 3,
              CortaMus: 2,
              Descartes: 4,
              Interactividad: 3
            },
            description: 'Con su delantal siempre impecable, este chef ve el Mus como una receta perfecta. Cada jugada es como añadir un ingrediente especial a su plato, siempre buscando el equilibrio perfecto.'
          },
          {
            id: 15,
            name: 'El Friki Matemático',
            skills: {
              Atrevido: 2,
              Faroleo: 3,
              CazaSeñas: 5,
              CortaMus: 5,
              Descartes: 4,
              Interactividad: 1
            },
            description: 'Para él, cada carta es un número en una ecuación compleja. Juega con lógica implacable, y su cálculo mental es tan rápido como una calculadora.'
          },
          {
            id: 16,
            name: 'El Político',
            skills: {
              Atrevido: 4,
              Faroleo: 5,
              CazaSeñas: 3,
              CortaMus: 4,
              Descartes: 3,
              Interactividad: 5
            },
            description: 'Sabe cómo negociar y persuadir. En el Mus, usa su carisma para manipular y hacer que los demás jueguen a su favor. Siempre tiene un truco bajo la manga.'
          }
        ]
      };
    },
    computed: {
      uniqueSkills() {
        const skills = new Set();
        this.characters.forEach(character => {
          Object.keys(character.skills).forEach(skill => skills.add(skill));
        });
        return Array.from(skills);
      },
      filteredCharacters() {
        return this.characters.filter(character => {
          const matchesSearchTerm = character.name.toLowerCase().includes(this.searchTerm.toLowerCase());
          const matchesSkillFilter = this.selectedSkill === '' || character.skills[this.selectedSkill] !== undefined;
          return matchesSearchTerm && matchesSkillFilter;
        });
      }
    }
  };
  </script>
  
  <style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animación para el grid de personajes */
.grid > div {
  transition: all 0.3s ease-in-out;
}

.grid > div:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

/* Animación para el botón de elegir */
button {
  transition: all 0.3s ease-in-out;
}

button:not(:disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 255, 0, 0.3);
}
</style>